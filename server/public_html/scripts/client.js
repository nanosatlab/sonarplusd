(function () {
    window.addEventListener("DOMContentLoaded", function () {
        var vupdate_interval;
        var is_streaming = false;
        var is_connecting = false;
        /* WebSocket to control spacecraft model and receive sensor data: */
        var socket = io("http://192.168.2.120:52001");  // <--- This is the IP and port the server is listening to.
        var iosocket_connected = false;
        var fn1_btn = document.getElementById("fn-1");
        var fn2_btn = document.getElementById("fn-2");
        var fn3_btn = document.getElementById("fn-3");
        var fn4_btn = document.getElementById("fn-4");
        var start_btn = document.getElementById("start");
        var capture_btn = document.getElementById("capture");
        var video = document.getElementById("payload-video");
        var canvas = document.getElementById("payload-video-canvas");
        var ctx = canvas.getContext("2d");
        var effect = document.getElementById("effect");
        var btn_message = document.getElementById("start-btn-message");
        btn_message.innerHTML = "Connect to payload";

        fn1_btn.onclick = function(e) {
            /*
             *  YOUR CODE SHOULD GO HERE ;)
             */
            if(iosocket_connected) {
                /*  Data can be sent to the server using socket.emit("<your_event_id>", JSON.stringify(your_object));
                 *  Check requestSensorData() or setLEDMatrix() functions to see working examples.
                 */
            }
        };

        fn2_btn.onclick = function(e) {
            /*
             *  YOUR CODE SHOULD GO HERE ;)
             */
            if(iosocket_connected) {
                /*  Data can be sent to the server using socket.emit("<your_event_id>", JSON.stringify(your_object));
                 *  Check requestSensorData() or setLEDMatrix() functions to see working examples.
                 */
            }
        };

        fn3_btn.onclick = function(e) {
            /*
             *  YOUR CODE SHOULD GO HERE ;)
             */
            if(iosocket_connected) {
                /*  Data can be sent to the server using socket.emit("<your_event_id>", JSON.stringify(your_object));
                 *  Check requestSensorData() or setLEDMatrix() functions to see working examples.
                 */
            }
        };

        fn4_btn.onclick = function(e) {
            /*
             *  YOUR CODE SHOULD GO HERE ;)
             */
            if(iosocket_connected) {
                /*  Data can be sent to the server using socket.emit("<your_event_id>", JSON.stringify(your_object));
                 *  Check requestSensorData() or setLEDMatrix() functions to see working examples.
                 */
            }
        };

        capture_btn.onclick = function(e) {
            var countdown;
            if(!is_streaming && !is_connecting) {
                countdown = 3;
            } else {
                countdown = 5;
                disconnect();
            }
            var capture_interval = setInterval(function() {
                if(countdown == 0) {
                    clearInterval(capture_interval);
                    capture_btn.innerHTML = "<i class=\"fa fa-camera\"></i>&nbsp;&nbsp;Download capture";

                    alert("Ooops... This function is not yet implemented ;)");

                    /*******************************************************************************
                     *  SOME OF YOUR CODE SHOULD GO HERE!
                     *  Hint:
                     *      Your on-board computer (Raspberry Pi) has an utility named raspistill
                     *      that can be used to connect to the camera and take pictures with the
                     *      desired resolution and configuration. Documentation can be read here:
                     *
                     *      https://www.raspberrypi.org/documentation/usage/camera/raspicam/raspistill.md
                     *
                     *      You may want to send a message to the server (e.g. using the
                     *      socket.emit() function) to request an image. The image could be obtained
                     *      by launching `raspistill` from 'server.js'.
                     *
                     *      ;)
                     ******************************************************************************/

                } else {
                    capture_btn.innerHTML = "<i class=\"fa fa-camera\"></i>&nbsp;&nbsp;Downloading in... " + countdown;
                    countdown--;
                }
            }, 1000);

        };


/* -------------------------------------------------------------------------------------------------------- */


        /*******************************************************************************************
         *  WARNING: Ask the workshop organizers before modifying the code below. Most of the
         *  functionality depends on the lines of code below. New actions or functions, should be
         *  implemented within the event listener functions above. ;)
         ******************************************************************************************/

        /** (Do not modify)
         *  Function to request all sensor data from SenseHat.
         *  Sends a JSON-formated object through the
         */
        function requestSensorData() {
            if(iosocket_connected) {
                var req = {
                    type: "data",
                    opt: "all"
                };
                socket.emit("req", JSON.stringify(req));
                console.log("Sensor data request sent.");
                var d = new Date();
                watchdog_time = d.getTime();
            } else {
                console.log("Sensor data cannot be requested because socket is not connected.");
            }
        }

        function setLEDMatrix(ac_opt) {
            if(iosocket_connected) {
                var req = {
                    type: "action",
                    opt: ac_opt
                };
                socket.emit("req", JSON.stringify(req));
            } else {
                console.log("LED matrix cannot be operated because socket is not connected.");
            }
        }

        start_btn.onclick = function(e) {
            if(!is_streaming && !is_connecting) {
                var address = "192.168.2.120/webrtc";
                var protocol = location.protocol === "https:" ? "wss:" : "ws:";
                var wsurl = protocol + "//" + address;
                is_connecting = true;
                document.getElementById("start-icon-spinner").style.display = "inline";
                document.getElementById("start-icon-check").style.display   = "none";
                btn_message.innerHTML = "Connecting to payload";

                signal(wsurl,
                        function(stream) {
                            console.log("Got a stream!");
                            var url = window.URL || window.webkitURL;
                            is_connecting = false;
                            if(!is_streaming) {
                                is_streaming = true;
                                video.srcObject = stream;
                                console.log("Going to play the video, now.");
                                video.play();
                            }
                        },
                        function(error) {
                            alert(error);
                        },
                        function() {
                            console.log("WebRTC socket closed. Bye bye!");
                            clearInterval(vupdate_interval);
                            start_btn.classList.remove("btn-ok");
                            document.getElementById("start-icon-spinner").style.display = "none";
                            document.getElementById("start-icon-check").style.display   = "none";
                            btn_message.innerHTML = "Connect to payload";
                            is_streaming = false;
                            var w = canvas.getAttribute("width");
                            var h = canvas.getAttribute("height");
                            ctx.clearRect(0, 0, w, h);
                        },
                        function(message) {
                            alert(message);
                        }
                );
            } else if(is_streaming && !is_connecting) {
                disconnect();
            }
        };

        // Wait until the video stream can play
        video.oncanplay = function(e) {
            if(!is_streaming) {
                canvas.setAttribute("width", video.videoWidth);
                canvas.setAttribute("height", video.videoHeight);
                is_streaming = true;
            }
        };

        // Wait for the video to start to play
        video.onplay = function() {
            console.log("Playback started!");
            document.getElementById("start-icon-spinner").style.display = "none";
            document.getElementById("start-icon-check").style.display   = "inline";
            btn_message.innerHTML = "Connected";
            start_btn.classList.add("btn-ok");

            // Every 33 milliseconds copy the video image to the canvas
            vupdate_interval = setInterval(function() {
                if (video.paused || video.ended) {
                    return;
                }
                var w = canvas.getAttribute("width");
                var h = canvas.getAttribute("height");
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(video, 0, 0, w, h);
            }, 33);
        };


        var alt_initial;
        var watchdog_time = 0;
        setInterval(function() {
            var d = new Date();
            if(d.getTime() - watchdog_time > 60000 && iosocket_connected) {
                console.log("It seems that the server has not replied with data to the previous request. Requesting again.");
                setTimeout(requestSensorData, 10);
            }
        }, 15000);

        /* Measured values: */
        var sensors_box = document.getElementById("sensors-box");
        var info_box  = document.getElementById("info-box");
        var info_msg  = document.getElementById("info-msg");
        var roll      = document.getElementById("roll");
        var pitch     = document.getElementById("pitch");
        var yaw       = document.getElementById("yaw");
        var vel_x     = document.getElementById("vel-x");
        var vel_y     = document.getElementById("vel-y");
        var vel_z     = document.getElementById("vel-z");
        var acc_x     = document.getElementById("acc-x");
        var acc_y     = document.getElementById("acc-y");
        var acc_z     = document.getElementById("acc-z");
        var mag_dir   = document.getElementById("mag-dir");
        var mag_x     = document.getElementById("mag-x");
        var mag_y     = document.getElementById("mag-y");
        var mag_z     = document.getElementById("mag-z");
        var pressure  = document.getElementById("pressure");
        var altitude  = document.getElementById("altitude");
        var alt_delta = document.getElementById("altitude-delta");
        var humidity  = document.getElementById("humidity");
        var temp_cpu  = document.getElementById("temp-cpu");
        var temp1     = document.getElementById("temp1");
        var temp2     = document.getElementById("temp2");

        socket.on("connected", function() {
            console.log("WebSocket connected.");
            iosocket_connected = true;
            requestSensorData();
        });

        socket.on("disconnected", function() {
            console.log("WebSocket closed.");
            iosocket_connected = false;
            sensors_box.style.display = "none";
            info_box.style.display = "block";
        });

        socket.on("res", function(res_obj) {
            switch(res_obj.value) {
                case "ok":
                    console.log("Server replied with OK.");
                    break;
                case "data":
                    console.log("Server replied with data:", res_obj);
                    setTimeout(requestSensorData, 5000);
                    var d = new Date();
                    watchdog_time = d.getTime();

                    sensors_box.style.display = "block";
                    info_box.style.display = "none";

                    /* Compute mean of orientation values (from accelerometer and gyroscope): */
                    let roll  = (res_obj.sense_hat.imu.gyro.roll  + res_obj.sense_hat.imu.acc.roll)  / 2;
                    let pitch = (res_obj.sense_hat.imu.gyro.pitch + res_obj.sense_hat.imu.acc.pitch) / 2;
                    let yaw   = (res_obj.sense_hat.imu.gyro.yaw   + res_obj.sense_hat.imu.acc.yaw)   / 2;
                    /* Convert acceleration in g's to m/s²: */
                    let acc_metres_sec_x = res_obj.sense_hat.imu.accr.x * 9.80665;
                    let acc_metres_sec_y = res_obj.sense_hat.imu.accr.y * 9.80665;
                    let acc_metres_sec_z = res_obj.sense_hat.imu.accr.z * 9.80665;
                    /* Convert velocity in radians per second to degrees per second: */
                    let vel_deg_sec_x = res_obj.sense_hat.imu.gyror.x * 180.0 / Math.PI;
                    let vel_deg_sec_y = res_obj.sense_hat.imu.gyror.y * 180.0 / Math.PI;
                    let vel_deg_sec_z = res_obj.sense_hat.imu.gyror.z * 180.0 / Math.PI;

                    /* Write values: */
                    roll.innerHTML = roll.toFixed(2);
                    pitch.innerHTML = pitch.toFixed(2);
                    yaw.innerHTML = yaw.toFixed(2);
                    vel_x.innerHTML = vel_deg_sec_x.toFixed(2);
                    vel_y.innerHTML = vel_deg_sec_y.toFixed(2);
                    vel_z.innerHTML = vel_deg_sec_z.toFixed(2);
                    acc_x.innerHTML = acc_metres_sec_x.toFixed(2);
                    acc_y.innerHTML = acc_metres_sec_y.toFixed(2);
                    acc_z.innerHTML = acc_metres_sec_z.toFixed(2);
                    mag_dir.innerHTML = res_obj.sense_hat.imu.mag.toFixed(2);
                    mag_x.innerHTML = res_obj.sense_hat.imu.magr.x.toFixed(2);
                    mag_y.innerHTML = res_obj.sense_hat.imu.magr.y.toFixed(2);
                    mag_z.innerHTML = res_obj.sense_hat.imu.magr.z.toFixed(2);
                    pressure.innerHTML = res_obj.sense_hat.env.pres.toFixed(2);
                    humidity.innerHTML = res_obj.sense_hat.env.hum.toFixed(2);
                    temp_cpu.innerHTML = res_obj.sense_hat.env.tempcpu.toFixed(2);
                    temp1.innerHTML = res_obj.sense_hat.env.temph.toFixed(2);
                    temp2.innerHTML = res_obj.sense_hat.env.tempp.toFixed(2);

                    /*  How to compute barometric altitude:
                     *  https://en.wikipedia.org/wiki/Atmospheric_pressure
                     */
                    var h = (Math.pow((1013.25 / res_obj.sense_hat.env.pres), 0.28506281114) - 1) / 0.00003379656;
                    if(!alt_initial) {
                        alt_initial = h;
                    }
                    altitude.innerHTML = h.toFixed(2);
                    alt_delta.innerHTML = (h - alt_initial).toFixed(2);
                    break;
                case "err":
                    console.log("Server replied with error:", res_obj);
                    break;
            }
        });

        var led_opt   = document.getElementById("led-opt");
        var led_text  = document.getElementById("led-text");
        var led_color = document.getElementById("led-color");

        led_opt.onchange = function() {
            switch(led_opt.selectedIndex) {
                case 0: /* LED Off */
                    led_text.style.display = "none";
                    led_color.style.display = "none";
                    setLEDMatrix({off: ""});
                    break;
                case 1: /* LED Sónar calling */
                    led_text.style.display = "none";
                    led_color.style.display = "none";
                    setLEDMatrix({sc: ""});
                    break;
                case 2: /* LED Color */
                    led_text.style.display = "none";
                    led_color.style.display = "block";
                    setLEDMatrix({color: String(led_color.value)});
                    break;
                case 3: /* LED Text */
                    led_text.style.display = "block";
                    led_color.style.display = "none";
                    setLEDMatrix({text: String(led_text.value)});
                    break;
                case 4: /* LED Image */
                    led_text.style.display = "none";
                    led_color.style.display = "none";
                    setLEDMatrix({image: ""});
                    break;
                case 5: /* LED Pattern */
                    led_text.style.display = "none";
                    led_color.style.display = "none";
                    setLEDMatrix({pattern: ""});
                    break;
                case 6: /* LED Countdown */
                    led_text.style.display = "none";
                    led_color.style.display = "none";
                    setLEDMatrix({countdown: 9});
                    alert("Ooops...! This is not implemented! You can complete it in 'app/sensehat_led_control.py'.");
                    break;
                default:
                    break;
            }
        };
        led_text.onchange = function() {
            setLEDMatrix({text: String(led_text.value)});
        };
        led_color.onchange = function() {
            setLEDMatrix({color: String(led_color.value)});
        };
    });
})();
