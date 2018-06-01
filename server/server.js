/* Import additional Node.js modules: */
var http = require("http").createServer(httpHandler);   // Require HTTP server, and create server with function httpHandler().
var fs = require("fs");                             // Require filesystem module
var io = require("socket.io")(http)                 // Require socket.io module and pass the http object (server)
const { spawn } = require("child_process");         // Require child_process module to spawn other processes.

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
                    const child = spawn("../app/sensehat_if.py");
                    child.on("exit", function(code, signal) {
                        console.log("SenseHat Interface child process exited with code: ", code);
                        reply["err"] = code;
                        if(code != 0 || !reply_data) {
                            reply["value"] = "err";
                        } else {
                            reply["sense_hat"] = JSON.parse(reply_data);
                        }
                        iosocket.emit("res", reply);
                    });
                    child.stdout.on("data", (msg) => {
                        reply["value"] = "data";
                        reply_data += msg;
                    });
                    break;
                case "action":
                    console.log("WebSocket action request.");
                    var res = {
                        value: "ok"
                    }
                    iosocket.emit("res", JSON.stringify(res));
                    break;
                default:
                    console.log("WebSocket unknown request type: ", data_obj);
                    iosocket.emit("res", "hello error!");
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
