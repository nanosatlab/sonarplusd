(function () {
    window.addEventListener("DOMContentLoaded", function () {
        var vupdate_interval;
        var is_streaming = false;
        var is_connecting = false;
        var start_btn = document.getElementById("start");
        var capture_btn = document.getElementById("capture");
        var video = document.getElementById("payload-video");
        var canvas = document.getElementById("payload-video-canvas");
        var ctx = canvas.getContext("2d");
        var effect = document.getElementById("effect");
        var btn_message = document.getElementById("start-btn-message");
        btn_message.innerHTML = "Connect to payload";

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
                    window.open("http://192.168.2.120:8080/stream/snapshot.jpeg?delay_s=0", "_self");
                } else {
                    countdown--;
                }
            }, 1000);

        };

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

        /* WebSocket to control spacecraft model and receive sensor data: */
        var socket = io("http://192.168.2.120:52001");
        var iosocket_connected = false;
        var alt_initial;

        /* Measured values: */
        var sensors_box = document.getElementById("sensors-box");
        var info_box   = document.getElementById("info-box");
        var info_msg   = document.getElementById("info-msg");
        var gyro_roll  = document.getElementById("gyro-roll");
        var gyro_pitch = document.getElementById("gyro-pitch");
        var gyro_yaw   = document.getElementById("gyro-yaw");
        var acc_roll   = document.getElementById("acc-roll");
        var acc_pitch  = document.getElementById("acc-pitch");
        var acc_yaw    = document.getElementById("acc-yaw");
        var acc_rollg  = document.getElementById("acc-rollg");
        var acc_pitchg = document.getElementById("acc-pitchg");
        var acc_yawg   = document.getElementById("acc-yawg");
        var mag_dir    = document.getElementById("mag-dir");
        var mag_x      = document.getElementById("mag-x");
        var mag_y      = document.getElementById("mag-y");
        var mag_z      = document.getElementById("mag-z");
        var pressure   = document.getElementById("pressure");
        var altitude   = document.getElementById("altitude");
        var alt_delta  = document.getElementById("altitude-delta");
        var humidity   = document.getElementById("humidity");
        var temp_cpu   = document.getElementById("temp-cpu");
        var temp1      = document.getElementById("temp1");
        var temp2      = document.getElementById("temp2");

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
                    sensors_box.style.display = "block";
                    info_box.style.display = "none";
                    gyro_roll.innerHTML = res_obj.sense_hat.imu.gyro.roll.toFixed(2);
                    gyro_pitch.innerHTML = res_obj.sense_hat.imu.gyro.pitch.toFixed(2);
                    gyro_yaw.innerHTML = res_obj.sense_hat.imu.gyro.yaw.toFixed(2);
                    acc_roll.innerHTML = res_obj.sense_hat.imu.acc.roll.toFixed(2);
                    acc_pitch.innerHTML = res_obj.sense_hat.imu.acc.pitch.toFixed(2);
                    acc_yaw.innerHTML = res_obj.sense_hat.imu.acc.yaw.toFixed(2);
                    acc_rollg.innerHTML = res_obj.sense_hat.imu.accr.x.toFixed(2);
                    acc_pitchg.innerHTML = res_obj.sense_hat.imu.accr.y.toFixed(2);
                    acc_yawg.innerHTML = res_obj.sense_hat.imu.accr.z.toFixed(2);
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
                    var h = (Math.pow((res_obj.sense_hat.env.pres / 1013.25), 0.28506281114) - 1) / 0.00003379656;
                    if(!alt_initial) {
                        alt_initial = h;
                    }
                    altitude.innerHTML = h.toFixed(2);
                    alt_delta.innerHTML = (h - alt_initial).toFixed(2);
                    setTimeout(requestSensorData, 2000);
                    break;
                case "err":
                    console.log("Server replied with error:", res_obj);
                    break;
            }
        });

        function requestSensorData() {
            if(iosocket_connected) {
                var req = {
                    type: "data",
                    opt: "all"
                };
                socket.emit("req", JSON.stringify(req));
                console.log("Sensor data request sent.");
            } else {
                console.log("Sensor data cannot be requested because socket is not connected.");
            }
        }

        function setLEDMatrix(ac_opt) {
            if(iosocket_connected) {
                var req = {
                    type: "action",
                    opt: JSON.stringify(ac_opt)
                };
                socket.emit("req", JSON.stringify(req));
            } else {
                console.log("LED matrix cannot be operated because socket is not connected.");
            }
        }

        var led_opt   = document.getElementById("led-opt");
        var led_text  = document.getElementById("led-text");
        var led_color = document.getElementById("led-color");

        led_opt.onchange = function() {
            switch(led_opt.selectedIndex) {
                case 0: /* LED Off */
                    led_text.style.display = "none";
                    led_color.style.display = "none";
                    break;
                case 1: /* LED Sónar calling */
                    led_text.style.display = "none";
                    led_color.style.display = "none";
                    break;
                case 2: /* LED Color */
                    led_text.style.display = "none";
                    led_color.style.display = "block";
                    break;
                case 3: /* LED Text */
                    led_text.style.display = "block";
                    led_color.style.display = "none";
                    break;
                default:
                    break;
            }
        };
        led_text.onchange = function() {

        };
        led_color.onchange = function() {
            var opts = {
                color: String(led_color.value)
            }
            setLEDMatrix(opts);
        };
    });
})();
