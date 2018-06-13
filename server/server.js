/* Import additional Node.js modules: */
var http = require("http").createServer(httpHandler);   // Require HTTP server, and create server with function httpHandler().
var fs = require("fs");                             // Require filesystem module
var io = require("socket.io")(http)                 // Require socket.io module and pass the http object (server)
const { spawn } = require("child_process");         // Require child_process module to spawn other processes.
const { exec }  = require("child_process");         // Require child_process module to spawn other processes.

/* Global constant values: */
var root_path = "/home/pi/sonarplusd/server/";      // Server root path.
var public_html_path = root_path + "public_html";   // Public files for HTTP requests.

/* Start HTTP socket: */
http.listen(52001);                                 // Listen to port 52001.

function httpResponse(request, response, err, data)
{
    var dotoffset = request.url.lastIndexOf(".");
    // console.log("HTTP Requested URL: ", request.url);
    var mimetype = "application/octet-stream";
    if(dotoffset > 0) {
        var mimetype_lut = {
            ".html"  : "text/html",
            ".ico"   : "image/x-icon",
            ".jpg"   : "image/jpeg",
            ".png"   : "image/png",
            ".gif"   : "image/gif",
            ".css"   : "text/css",
            ".js "   : "text/javascript",
            ".woff"  : "application/font-woff",
            ".woff2" : "application/font-woff2",
            ".eot"   : "application/vnd.ms-fontobject",
            ".ttf"   : "application/x-font-truetype"
        }
        if(request.url.substr(dotoffset) in mimetype_lut) {
            mimetype = mimetype_lut[request.url.substr(dotoffset)];
        } else {
            console.log("HTTP Response Warning: requested an unknown mimetype \'%s\'", mimetype_lut[request.url.substr(dotoffset)]);
        }
    }
    if(!err) {
        response.writeHead(200, {"Content-Type" : mimetype});
        response.end(data);
        console.log("HTTP OK: ", request.url, mimetype);
    } else {
        fs.readFile(root_path + "httpresponses/404.html", function(e, d) {
            if(!e) {
                response.writeHead(404, {"Content-Type" : "text/html"});
                response.end(d);
            } else {
                console.log("HTTP Response Error: can't find 404 page.")
                response.writeHead(500, "Server error");
                response.end();
            }
        });
    }
}

function httpHandler(request, response)
{
    request.url = public_html_path + (request.url == "/" ? "index.html" : request.url);
    fs.readFile(request.url, function(err, data) {
        httpResponse(request, response, err, data);
    });
}

/* Start WebSocket sockets: */
var iosocket;
var iosocket_connected = false;
var allow_spawn = true;

io.sockets.on("connection", function(s) {
    iosocket = s;
    iosocket_connected = true;
    iosocket.emit("connected");
    console.log("WebSocket is connected.");

    /*  Install event listeners: */
    iosocket.on("disconnect", function() {
        iosocket_connected = false;
    });

    iosocket.on("req", function(data) {
        console.log("WebSocket request!");
        var data_obj = JSON.parse(data);
        if("type" in data_obj) {
            switch(data_obj.type) {
                case "data":
                    console.log("WebSocket data request.");
                    /* Initialize reply data structure: */
                    var reply = {
                        "value": "err",
                        "err": -1
                    };
                    var reply_data = "";
                    if(allow_spawn) {
                        allow_spawn = false;
                        var child = spawn("../app/sensehat_if.py");
                        child.on("exit", function(code, signal) {
                            console.log("SenseHat Interface child process exited with code: ", code);
                            reply["err"] = code;
                            if(code != 0 || !reply_data) {
                                reply["value"] = "err";
                            } else {
                                reply["sense_hat"] = JSON.parse(reply_data);
                            }
                            iosocket.emit("res", reply);
                            allow_spawn = true;
                        });
                        child.stdout.on("data", (msg) => {
                            reply["value"] = "data";
                            reply_data += msg;
                        });
                    } else {
                        console.log("Data request will cannot be served because the previous one has not finished.");
                        iosocket.emit("res", reply);
                    }
                    break;
                case "action":
                    let led_options;
                    let res = { };
                    if("off" in data_obj.opt) {
                        console.log("WebSocket action request: off");
                        led_options = ["-o"];
                        res["value"] = "ok";
                    } else if("sc" in data_obj.opt) {
                        console.log("WebSocket action request: Sónar calling effect");
                        led_options = ["-s"];
                        res["value"] = "ok";
                    } else if("color" in data_obj.opt) {
                        console.log("WebSocket action request: solid color. Options: ", data_obj.opt);
                        led_options = ["-c", data_obj.opt["color"]];
                        res["value"] = "ok";
                    } else if("text" in data_obj.opt) {
                        console.log("WebSocket action request: scrolling text. Options: ", data_obj.opt);
                        led_options = ["-t", data_obj.opt["text"]];
                        res["value"] = "ok";
                    } else if("image" in data_obj.opt) {
                        console.log("WebSocket action request: image");
                        led_options = ["-i"];
                        res["value"] = "ok";
                    } else if("pattern" in data_obj.opt) {
                        console.log("WebSocket action request: pattern");
                        led_options = ["-p"];
                        res["value"] = "ok";
                    } else if("countdown" in data_obj.opt) {
                        console.log("WebSocket action request: countdown from ", data_obj.opt["countdown"]);
                        led_options = ["-d", data_obj.opt["countdown"]];
                        res["value"] = "ok";
                    } else {
                        console.log("WebSocket action request failed: unknown option", data_obj.opt);
                        res["value"] = "err";
                    }
                    var p1 = spawn("pkill", ["-f", "sensehat_led_control.py"]);
                    p1.stdout.on("data", (msg) => {
                        console.log(msg);
                    });
                    p1.on("exit", function(code, signal) {
                        var p2 = spawn("../app/sensehat_led_control.py", led_options);
                        p2.stdout.on("data", (msg) => {
                            console.log(msg);
                        });
                    });
                    iosocket.emit("res", JSON.stringify(res));
                    break;
                default:
                    console.log("WebSocket unknown request type: ", data_obj);
                    res["value"] = "err";
                    iosocket.emit("res", JSON.stringify(res));
                    break;
            }
        } else {
            console.log("WebSocket unknown request: ", data_obj);
        }
    });
});

/* Signal handlers: */
process.on("SIGINT", function() {
    if(iosocket_connected) {
        console.log("Disconnecting socket.");
        iosocket.emit("disconnected");
    }

    console.log("Exiting server.");
    process.exit();
});
