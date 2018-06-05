RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription;
RTCIceCandidate = window.RTCIceCandidate;
var ws;

function disconnect() {
    var rqst = {
        what: "hangup"
    };
    ws.send(JSON.stringify(rqst));
}

function signal(url, onStream, onError, onClose, onMessage) {
    if("WebSocket" in window) {
        console.log("Opening web socket: " + url);
        var pc;
        ws = new WebSocket(url);

        ws.onopen = function () {
            /* First we create a peer connection */
            var config = {"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]};
            // var options = {optional: []};
            pc = new RTCPeerConnection(config);

            pc.onicecandidate = function (event) {
                if(event.candidate) {
                    var candidate = {
                        sdpMLineIndex: event.candidate.sdpMLineIndex,
                        sdpMid: event.candidate.sdpMid,
                        candidate: event.candidate.candidate
                    };
                    var request = {
                        what: "addIceCandidate",
                        data: JSON.stringify(candidate)
                    };
                    ws.send(JSON.stringify(request));
                } else {
                    console.log("End of candidates.");
                }
            };

            if("ontrack" in pc) {
                pc.ontrack = function(event) {
                    onStream(event.streams[0]);
                };
            } else {  // onaddstream() deprecated
                pc.onaddstream = function (event) {
                    onStream(event.stream);
                };
            }

            pc.onremovestream = function(event) {
                console.log("The stream has been removed.");
            };

            pc.ondatachannel = function(event) {
                console.log("A data channel is available.");
            };

            /* kindly signal the remote peer that we would like to initiate a call */
            var request = {
                what: "call",
                options: {
                    force_hw_vcodec: true,
                    // vformat: 30 /*  640x480-30fps */
                    // vformat: 55 /* 1280x720-15fps */
                    vformat: 25 /* 640x480-15fps */
                }
            };
            ws.send(JSON.stringify(request));
        };

        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            var what = msg.what;
            var data = msg.data;

            console.log("Received message ==> " + what);

            switch (what) {
                case "offer":
                    var mediaConstraints = {
                        optional: [],
                        mandatory: {
                            OfferToReceiveAudio: false,
                            OfferToReceiveVideo: true
                        }
                    };
                    pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)),
                            function onRemoteSdpSuccess() {
                                pc.createAnswer(function (sessionDescription) {
                                    pc.setLocalDescription(sessionDescription);
                                    var request = {
                                        what: "answer",
                                        data: JSON.stringify(sessionDescription)
                                    };
                                    ws.send(JSON.stringify(request));
                                }, function (error) {
                                    onError("Failed to create answer: " + error);
                                }, mediaConstraints);
                            },
                            function onRemoteSdpError(event) {
                                onError("Failed to set the remote description: " + event);
                                ws.close();
                            }
                    );

                    var request = {
                        what: "generateIceCandidates"
                    };
                    ws.send(JSON.stringify(request));
                    break;

                case "answer":
                    break;

                case "message":
                    if (onMessage) {
                        onMessage(msg.data);
                    }
                    break;

                case "iceCandidates":
                    var candidates = JSON.parse(msg.data);
                    for (var i = 0; candidates && i < candidates.length; i++) {
                        var elt = candidates[i];
                        let candidate = new RTCIceCandidate({sdpMLineIndex: elt.sdpMLineIndex, candidate: elt.candidate});
                        pc.addIceCandidate(candidate,
                                function () {
                                    // console.log("IceCandidate added: " + JSON.stringify(candidate));
                                },
                                function (error) {
                                    console.error("addIceCandidate error: " + error);
                                }
                        );
                    }
                    break;
            }
        };

        ws.onclose = function (event) {
            console.log("Socket closed with code: " + event.code);
            if (pc) {
                pc.close();
                pc = null;
            }
            if(onClose) {
                onClose();
            }
        };

        ws.onerror = function (event) {
            onError("An error has occurred on the websocket (make sure the address is correct)!");
        };

    } else {
        onError("Sorry, this browser does not support Web Sockets. Bye.");
    }
}
