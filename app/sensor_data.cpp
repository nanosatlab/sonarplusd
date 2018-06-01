/***********************************************************************************************//**
 *  Write data to camera text overlay.
 *  @authors    Carles Araguz (CA), carles.araguz@upc.edu
 *  @date       2018-mai-09
 *  @version    0.1
 *  @copyright  This file is part of a project developed by Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab) at Technical University of Catalonia - UPC BarcelonaTech and
 *              Institut d'Estudis Espacials de Catalunya (IEEC).
 **************************************************************************************************/

#include "sensor_data.hpp"

#define MARGIN_X    5
#define MARGIN_Y    25

std::string getCPUTemp(void)
{
    // std::cout << "Getting CPU temperature...\n";
    int fd[2];
    if(pipe(fd) < 0) {
        return "ERROR";
    }
    std::string retval = "ERROR";
    pid_t pid = fork();
    if(pid == 0) {
        /* Child, redirect output and execute process: */
        close(1);
        dup(fd[1]);
        close(fd[1]);
        close(fd[0]);
        execlp("vcgencmd", "vcgencmd", "measure_temp", (char *)nullptr);
        std::cerr << "vcgencmd could not be executed\n";
        std::exit(-1);
    } else {
        close(fd[1]);
        char buf[200];
        int rop;
        if((rop = read(fd[0], buf, 200)) > 0) {
            std::stringstream ss;
            ss << buf;
            /* Format rule of the first line in the TLE */
            std::string rformat = "temp=([0-9\\.]+)'C";
            std::regex regex_rule(rformat);
            std::smatch matched_values;
            std::string str_aux = ss.str();
            std::regex_search(str_aux, matched_values, regex_rule);
            if(matched_values.size() >= 1) {
                std::string temp_parsed = matched_values[1];
                ss.str(std::string());
                ss << "OBC Temp.: " << temp_parsed << " \'C";
                ss << " / " << std::atof(temp_parsed.c_str()) + 273.15 << " K.";
                retval = ss.str();
            }
        }
    }
    return retval;
}

std::string getTime(void)
{
    // std::cout << "Getting time...\n";
    std::locale::global(std::locale("en_US.utf8"));
    std::time_t t = std::time(nullptr);
    char mbstr[100];
    std::stringstream ss;
    if(std::strftime(mbstr, sizeof(mbstr), "%T", std::localtime(&t))) {
        ss << "S/C time: " << mbstr;
    }
    return ss.str();
}

template <class Writer>
void setJSONColor(unsigned int r, unsigned int g, unsigned int b, Writer& w)
{
    w.Key("red");
    w.Uint(r);
    w.Key("green");
    w.Uint(g);
    w.Key("blue");
    w.Uint(b);
}

std::string linesToJSON(std::vector<std::string> strs)
{
    rapidjson::StringBuffer str_buf;
    rapidjson::PrettyWriter<rapidjson::StringBuffer> writer(str_buf);
    writer.StartArray();
    writer.StartObject();

    if(strs.size() >= 1) {
        /* Start parameters: */
        writer.Key("font");
        writer.String("simplex");
        writer.Key("bottom_left");
        writer.Bool(false);

        int shadowed = 0;
        while(shadowed < 2) {
            /* Start position and color: */
            writer.Key("x");
            writer.Int(MARGIN_X - shadowed);
            writer.Key("y");
            writer.Int(MARGIN_Y - shadowed);
            setJSONColor(200 * shadowed, 200 * shadowed, 200 * shadowed, writer);

            /* Header text: */
            writer.Key("thickness");
            writer.Uint(2);
            writer.Key("scale");
            writer.Double(0.75);
            writer.Key("text_line");
            writer.String(strs[0].c_str());
            writer.EndObject();

            bool first = true;
            for(std::size_t line = 1; line < strs.size(); line++) {
                writer.StartObject();
                if(first) {
                    writer.Key("y");
                    writer.Int(MARGIN_Y - shadowed + 35);
                    writer.Key("scale");
                    writer.Double(0.5);
                    writer.Key("thickness");
                    writer.Uint(1);
                    first = false;
                }
                writer.Key("text_line");
                writer.String(strs[line].c_str());
                writer.EndObject();
            }
            if(++shadowed < 2) {
                writer.StartObject();
            }
        }

    }
    writer.EndArray();
    return str_buf.GetString();
}

int main(int /* argc */, char** /* argv */)
{
    auto fd = open("/dev/video0", O_RDWR | O_NONBLOCK);

    struct v4l2_queryctrl queryctrl;
    struct v4l2_control ctrl{0, 1};
    for(queryctrl.id = V4L2_CID_PRIVATE_BASE; ; ++queryctrl.id) {
        if(!ioctl(fd, VIDIOC_QUERYCTRL, &queryctrl)) {
            const std::string name{std::begin(queryctrl.name), std::end(queryctrl.name)};
            if(name.find("overlay") != std::string::npos) {
                ctrl.id = queryctrl.id;
                break;
            }
        } else {
            break;
        }
    }
    if(!ctrl.id) {
        std::cerr << "Text overlay not supported\n";
        return EXIT_FAILURE;
    }
    while(true) {
        std::vector<std::string> lines {
            "Sonar+D CubeSat",
            getCPUTemp(),
            getTime()
        };
        {
            std::ofstream fout("/home/pi/sonarplusd/app/data/sensor_data.json", std::ios::trunc);
            fout << linesToJSON(lines) << std::endl;
            // std::cout << linesToJSON(lines) << "\n";
        }
        if(ioctl(fd, VIDIOC_S_CTRL, &ctrl) == -1) {
            std::cerr << "Failed to notify the driver\n";
        }
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}
