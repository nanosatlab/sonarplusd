<p align="center">
<img src="res/logo_ieec_color.png" height="50" />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="res/logo_sonar+d_color.png" height="50" />
</p>


# How to build a CubeSat, part 2: software, test and operations
This document will guide you through the steps that you need to follow in order to complete the integration of your CubeSat model. In particular, all the software-related aspects, testing and install procedures are detailed below.

## Power up and verification
1. Ensure that all the electronic components are properly connected before supplying power to the system. Carefully check that:
    1. The Raspberry Pi must be connected to the Sense Hat board with the correct orientation (reversing the pin order may result in severe damage to both boards). Double-check that the LED matrix is not facing the Raspberry Pi.
    1. The flat camera cable (brown ribbon) is connected in both ends.
    1. The microSD card must be inserted in the RPi0W slot _before_ turning it on.
1. Power the system by connecting a USB charger to the micro USB port labeled with the letters "PWR" in your Raspberry Pi. Ensure that you are not mistakenly connecting it to the other port, labeled "USB". Don't be shy to ask the workshop organizers if you have questions.
1. Once power is provided to the board you will see that a small green LED turns on in your Raspberry Pi and that the LED matrix shows a colorful pattern for a while.
1. Precautions: do not disconnect any hardware component while power is on. Disconnect power from your board before checking cables and connections. Never remove the microSD card while the Raspberry Pi is on.

## Connect your computer to Raspberry Pi's WiFi
1. Your RPi0W is pre-configured to automatically operate as an WiFi access point. This means that you should be able to connect to its WiFi network with any wireless device (laptop, smartphone, etc.) The name of the WiFi (SSID) is **`SonarCubeSatN`** (where the `N` corresponds to your team number.) Password is `SonarPlusD2018`.
1. Be sure to connect your laptop to the correct board (you don't want to accidentally modify other's people work by connecting to the wrong SSID.)
1. The IP address of your spacecraft is: `192.168.2.120`. Remember it, you'll need it in the following steps.
1. Now that you are connected to your on-board computer, you can operate your CubeSat model right away. In order to do so, you have two options:
    * **SSH terminal:** you will use this option (instructions below) when you need to issue specific commands to the RPi0W. This will provide a text terminal console (i.e. no graphic interface!)
    * **Web-based operations centre:** If you are not familiar with the Linux terminal, you can still operate your satellite model with a graphical interface that we prepared for you. This will only allow you to manage your camera and read telemetry.
1. Proceed to opening an SSH terminal.
    * Linux and Mac users: open a text console and type:
            ssh pi@192.168.2.120
    * Windows users will need an SSH client. Any client should work, but we recommend using one named "PuTTY". It can be downloaded and used standalone (i.e. no installation required.) You may find it in the link below:

        https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html. Download an run "Alternative binary file > putty.exe". The program will show a screen with login options. In the "Sessions" category, type in the Host Name (IP Address): `192.168.2.120`. Connection type must be SSH and port number 22. Then click the "Open" (or "Connect") button.
1. For the sake of simplicity, we will use the default Raspberry Pi user: `pi`, with password: `raspberry` (both case sensitive.)
1. You can now issue terminal commands.

## Directory structure
A directory named `sonarplusd` has been installed on the Raspberry pi. It can be found in `/home/pi/sonarplusd`. This is the root folder for the workshop. Inside you will find the following sub-directories:
* `app`: contains Python scripts that interact with the Sense HAT board. It also has an example of a C++ implementation that interacts with sensors and the camera text-overlay interface.
* `server`: it holds a simple HTTP server implemented in Node.js. The components of this folder will be run to simulate your spacecraft communications subsystem. Gathering housekeeping and other telemetry, and executing telecommands is done by the files in this folder.
* `utils`: we have provided a set of miscellaneous utilities to test your hardware and manage network configuration. Some of the scripts within this folder will be used to verify that everything is properly connected.
* `res`: support files (images and backup copies of configuration files.) Do not modify the contents of this folder.

## Verification, test and sensor calibration
Before proceeding further, it is important to double-check that all your electronic devices are working fine. To do so, follow the instructions below.

### Check the camera
For now, all we will ensure is that the camera cable is properly connected. In your terminal window, issue the following command:

    vcgencmd get_camera

The result should be a message with this text: `supported=1 detected=1`. If the output message is different you need to check your camera connection. Remember to always turn off your board before (re-)connecting the cable.

### Check communication with the Sense HAT board
We can check that the board has been successfully installed by running one of the scripts in the _utils_ folder. To do so, navigate to the folder:

    cd /home/pi/sonarplusd/utils/

And execute the file named `test_sense_hat.py`:

    ./test_sense_hat.py

Your LED matrix display should display the message "Hello World!".

### Test and calibrate your IMU
The Inertial Measurement Unit is composed of a set of sensors: magnetometer, accelerometer and gyroscope. Together they allow us to determine the orientation of our spacecraft (or its "attitude", in space jargon.) The data of these sensors is fused automatically, but we can still read the independent output of each sensor. Three test scripts will allow us to determine whether the IMU is working as expected. You can run each of them independently with:

    ./test_imu_acceleration.py    # Will show acceleration in the three axis (x, y, z), in "g".
    ./test_imu_magnetometer.py    # Will show magnetic field in each axis (x, y, z), in micro-Teslas.
    ./test_imu_orientation.py     # Will show the orientation (i.e. rotation) for the axis roll, pitch and yaw.

In order to stop these scripts, simply press `Ctrl + C` (or `Cmd + Dot` for Mac users.)
Gently move your board to verify that readings are changing as you move the boards.

Now, if you pay close attention to the actual value output of the IMU, you'll probably notice that the values drift, or are slightly inaccurate. This is owed to the fact that your IMU's are not calibrated. You should now proceed to calibration of your boards, through a complex utility named `RTIMULibCal`. The instructions to do so, are partially taken from the [official Sense HAT page ](https://www.raspberrypi.org/documentation/hardware/sense-hat/).

In your SSH terminal and while in the `utils` directory, navigate to the RTEllipsoidFit folder and launch the calibration menu (text based):

    cd RTEllipsoidFit/
    RTIMULibCal

This will show a menu describing options "m", "e" and "a". Proceed to each of the calibration procedures one by one, and in the suggested order. Press lowercase `m` to start the magnetometer calibration with min./max. values. Read on-screen instructions and press any key to start.

After it starts, you will see something similar to this scrolling up the screen:

    Min x:  51.60  min y:  69.39  min z:  65.91
    Max x:  53.15  max y:  70.97  max z:  67.97

Focus on the two lines at the very bottom of the screen, as these are the most recently posted measurements from the program. Now you have to move the IMU around in every possible way you can think of. Ensure that the camera is not suspended from its cable and is tightly screwed to its supporting base.

Try and get a complete circle in each of the pitch, roll and yaw axes. Take care not to accidentally eject the SD card while doing this. Spend a few minutes moving the board, and stop when you find that the numbers are not changing anymore. Exit pressing lowercase `s`.

Only after this has been completed, you can proceed to calibrating the magnetometer with an ellipsoid fitting process (option `e`.) Instructions will appear on-screen. When completed, press `s` again and proceed to the accelerometer calibration (option `a`.)

When these procedures have been completed, press `x` to exit the calibration program. If you run the `ls` command now, you'll see that a new `RTIMULib.ini` file has been created. Copy this file to the IMU folder to complete the calibration:

    sudo cp RTIMULib.ini /etc -v

You have your sensors calibrated. You can repeat the tests from the beginning to verify the accuracy improvement.

## CubeSat control room
Up to now, you have been running commands directly from the Raspberry Pi terminal. You had access to all its features and programs. However, satellite operators need to rely on a telemetry and telecommand system to operate their spacecraft and control its mission. Your CubeSat's pre-programmed web-based interface will simulate your control room and will allow you to operate the spacecraft with a minimal set of commands and available actions. You may now open your favorite web browser and enter the following URL:

    http://192.168.2.120

The CubeSat Control Room should render in your screen. The buttons on the first row will allow you to connect to your main payload (i.e. camera) and stream its image in real-time. They will also allow you to control the LED matrix display, with a few predefined options. Please note that some of the options and button actions have been left unimplemented so that you can complete their code (optionally).

Verify that you can connect to the camera (click "Connect to payload") and see the real-time video stream on your screen. Point your camera to a distant feature and correct its focus until the image is sharp and clear. You can do so by gently rotating the outer ring of its lens.

On top of the camera stream, you should also see the message "Establishing telemetry link..." This notifies you that link to your spacecraft has only been established partially (i.e. only the camera data can be downlinked.) Commands and housekeeping data request can't still be sent to the CubeSat. In order to enable this, we need to start an on-board service. This service will collect data from IMU and on-board sensors and deliver it to your ground station (i.e. laptop) upon request. The command that you will need to issue is as follows:

    sudo systemctl start telemetry.service

Analogously, the service can be stopped at anytime with:

    sudo systemctl stop telemetry.service

Please note that this command will need to be issued every time our spacecraft is turned off and on again. This protects our satellite from being operated during its test campaing.

Once the telemetry service has been started, you should see the collected sensor data on top of your camera image. The data is automatically updated every 5 seconds. If you would encounter a problem (or the connection would not be established after starting the service), simply refresh your browser (hit `F5` on Windows/Linux or `CMD + R` on Mac.) This control room has been optimized for recent versions of Chrome, Firefox or Safari. Incompatibility or version issues may still affect your performance. If that's the case, change to a different browser. Also note that, although this control room can be accessed from multiple devices simultaneously (even with your smartphones), the camera stream can only be shown in one device at a time. All you need to do is connect your mobile devices or laptops to the same WiFi network provided by the RPi0W.

You now have your spacecraft fully operative. You may proceed to the final integration inside the structure (if you haven't already done so) or try to complete some of the proposed challenges!

## Challenges
Depending on your ability with a Linux terminal and your experience as a programmer, you may be tempted to fulfill some or all of the proposed challenges. These are all optional and should be easy to complete. Nonetheless, they require some level of expertise in programming. The languages used in the implementation of the on-board software and web-based interface are javascript (for Node.js), HTML5/CSS and Python. The implementation leverages on the [Python's Sense HAT library](https://pythonhosted.org/sense-hat/api/), Node.js packages ([socket.io](https://socket.io/) and [child_process](https://nodejs.org/api/child_process.html)) and a plug-and-play camera driver named [UV4L](https://www.linux-projects.org/uv4l/) which provide seamless streaming features, among many other options.

In order to complete these challenges, we recommend that you browse some of the on-line documentation for these projects. Moreover, it is important to understand what the elements of this software architecture are:

* `sonarplusd/app/sensehat_if.py` is a simple program implemented in Python which read the data from each and every on-board sensor and outputs their value in a JSON-formated object. Running it from a terminal will result in an output similar to this:

        {
            "env": {
                "hum": 57.70661163330078,
                "pres": 1014.0029296875,
                "tempcpu": 38.5,
                "temph": 29.12874984741211,
                "tempp": 27.879165649414062
            },
            "imu": {
                "acc": {
                    "pitch": 359.10057742476084,
                    "roll": 271.4744440920308,
                    "yaw": 265.92150029681045
                },
                "accr": {
                    "x": 0.06080819293856621,
                    "y": -3.3398475646972656,
                    "z": 0.08551201969385147
                },
                "gyro": {
                    "pitch": 359.10080100673446,
                    "roll": 271.4677300160767,
                    "yaw": 265.9214934666213
                },
                "gyror": {
                    "x": -0.012605372816324234,
                    "y": 0.008001886308193207,
                    "z": -0.013405967503786087
                },
                "mag": 265.91956052308615,
                "magr": {
                    "x": -1.2147454023361206,
                    "y": -22.25544548034668,
                    "z": 21.794546127319336
                }
            }
        }
* `sonarplusd/app/sensehat_led_control.py` is a Python program that allows control of the LED matrix display. This are the available options:

        ./sensehat_led_control.py <action> [<options>]. List of available actions:
            -s               Sonar Calling effect.
            -i               Load and display image file named 'image.png' (must be 8x8 pixels, PNG).
            -p               Display an 8x8 color pattern hardcoded in the source code.
            -c <color_hex>   Show solid color.
            -t <text>        Display text in a loop.
            -o               Turn off.
            -d <start val.>  Countdown option (unimplemented.)

* `sonarplusd/server/server.js` is a Node.js server that connects to your computer through a _WebSocket_ and replies to data and command requests. This javascript source code implements the commands accessible in your web-based GUI. It essentially listens for incoming requests and launches the above Python programs to execute the command.

* `sonarplusd/server/public_html` is a directory containing the HTML/CSS source code of the control room. Requests to this page are always served, even when the telemetry server is stopped.

* `sonarplusd/server/public_html/client.js` is the main javascript code that runs on your browser when you are using the control room. It listens to button events and sends requests to the telemetry and camera server. Some unimplemented functions can be addressed by adding new code here.

* `sonarplusd/server/public_html/signaling.js`. The control of the on-board camera is based on UV4L's WebRTC service. This script essentially handles the communication between your browser and the WebRTC service. You shouldn't require to modify this file.

### Editing code
Code can either be downloaded from GitHub (https://github.com/nanosatlab/sonarplusd) and modified in your laptops or edited directly from your RPi0W. The latter can be achieved with simple programs like `nano`. For example, editing a Python scritp could be done with the following command:

        nano path/to/the/file.py

`Ctrl + O` will save the changes and `Ctrl + X` will close `nano` and return to your terminal prompt.

### List of proposed challenges
1. Implement the "Download capture" button. The provided implementation stops the camera streaming process (WebRTC) and allows, thus, to take pictures with the camera. The utility `raspistill` ([documented here](https://www.raspberrypi.org/documentation/usage/camera/raspicam/raspistill.md)) should allow you to set-up the camera to take an image at full resolution. Your task is to let the user do the capture and download the result, just by clicking that button.
1. The camera video stream can also be captured with a media player. VLC is a very good option, which allows network playbacks among many other features. You can open this stream with VLC: http://192.168.2.120:8080/stream/video.mjpeg. The challenge will be to record the video (either with VLC or your preferred media player program.)
1. Implement a countdown in your LED matrix display. If you finish this challenge, you'll be able to use it during the launch campaing. Hint: the `sensehat_led_control.py` has a pre-implemented function that could be completed to do the countdown. You can easily edit the code with `nano /home/pi/sonarplusd/app/sensehat_led_control.py`.
1. UV4L allows text to be overlayed on the camera video stream. Find how to do so ([hint](https://www.linux-projects.org/uv4l/tutorials/text-overlay/)) and print your team name on the camera images.
1. The sky is the limit: propose and implement your own modification or custom feature ;)



____

_Institut d'Estudis Espacials de Catalunya (IEEC), 2018 / [www.ieec.cat](http://www.ieec.cat/)._
