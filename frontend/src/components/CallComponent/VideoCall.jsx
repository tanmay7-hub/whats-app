import "./videoCall.css";
import { useRef, useState, useEffect } from "react";
import socket from "../../sockets/socket.js";

export function VideoCall({ isCaller, currentConvo, onEndCall  , isVideoCall}) {
    const vidRef = useRef(null);
    const remoteVidRef = useRef(null);
    const peerRef = useRef(null);
    const streamRef = useRef(null);
    const pendingIceCandidatesRef = useRef([]);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
        const handleAnswer = async (answer) => {
            const peer = peerRef.current;

            if (!peer) return;

            await peer.setRemoteDescription(answer);

            for (const candidate of pendingIceCandidatesRef.current) {
                await peer.addIceCandidate(candidate);
            }

            pendingIceCandidatesRef.current = [];
        };

        socket.on("answer", handleAnswer);

        return () => {
            socket.off("answer", handleAnswer);
        };
    }, []);

    useEffect(() => {
        const handleOffer = async ({ offer, from }) => {
            const peer = peerRef.current;

            if (!peer) return;

            await peer.setRemoteDescription(offer);

            for (const candidate of pendingIceCandidatesRef.current) {
                await peer.addIceCandidate(candidate);
            }

            pendingIceCandidatesRef.current = [];

            const answer = await peer.createAnswer();

            await peer.setLocalDescription(answer);

            socket.emit("answer", {
                to: from,
                answer,
            });
        };

        socket.on("offer", handleOffer);

        return () => {
            socket.off("offer", handleOffer);
        };
    }, []);

    useEffect(() => {
        const handleIceCandidate = async (candidate) => {
            const peer = peerRef.current;

            if (!peer) return;

            if (peer.remoteDescription) {
                await peer.addIceCandidate(candidate);
            } else {
                pendingIceCandidatesRef.current.push(candidate);
            }
        };

        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.off("ice-candidate", handleIceCandidate);
        };
    }, []);

    useEffect(() => {
        async function startCamera() {
            try {
                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: (isVideoCall),
                        audio: true,
                    });

                streamRef.current = stream;

                if (vidRef.current) {
                    vidRef.current.srcObject = stream;
                }

                const peer = new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: "stun:stun.l.google.com:19302",
                        },
                    ],
                });

                peerRef.current = peer;

                peer.ontrack = (event) => {
                    const [remoteStream] = event.streams;

                    if (remoteVidRef.current) {
                        remoteVidRef.current.srcObject = remoteStream;
                    }
                };

                stream.getTracks().forEach((track) => {
                    peer.addTrack(track, stream);
                });

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("ice-candidate", {
                            to: currentConvo.id,
                            from: socket.id,
                            candidate: event.candidate,
                        });
                    }
                };

                if (isCaller) {
                    const offer = await peer.createOffer();

                    await peer.setLocalDescription(offer);

                    socket.emit("offer", {
                        to: currentConvo.id,
                        from: socket.id,
                        offer: peer.localDescription,
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }

            peerRef.current?.close();
        };
    }, [isCaller, currentConvo.id]);

    const toggleMute = () => {
        if (!streamRef.current) return;

        const audioTrack =
            streamRef.current.getAudioTracks()[0];

        if (!audioTrack) return;

        audioTrack.enabled = !audioTrack.enabled;

        setIsMuted(!audioTrack.enabled);
    };

    const toggleVideo = () => {
        if (!streamRef.current) return;

        const videoTrack =
            streamRef.current.getVideoTracks()[0];

        if (!videoTrack) return;

        videoTrack.enabled = !videoTrack.enabled;

        setIsVideoOff(!videoTrack.enabled);
    };

    return (
    <div className="call-main-container">

        <div className="remote-vid-div">

            {isVideoCall ? (
                <video
                    ref={remoteVidRef}
                    autoPlay
                    playsInline
                />
            ) : (
                <div className="voice-call-content">
                    <div className="voice-call-avatar">
                        {currentConvo?.name?.charAt(0) || "U"}
                    </div>

                    <div className="voice-call-name">
                        {currentConvo?.name || "User"}
                    </div>
                </div>
            )}

            <div className="caller-info">
                <div className="caller-avatar">
                    {currentConvo?.name?.charAt(0) || "U"}
                </div>

                <div>
                    <div className="caller-name">
                        {currentConvo?.name || "User"}
                    </div>

                    <div className="call-status">
                        {isCaller ? "Calling..." : "Connected"}
                    </div>
                </div>
            </div>

        </div>

        {isVideoCall && (
            <div
                className={`video-div ${
                    isVideoOff ? "camera-off" : ""
                }`}
            >
                {isVideoOff ? (
                    <div className="camera-off-content">
                        <div className="camera-off-avatar">
                            {currentConvo?.name?.charAt(0) || "U"}
                        </div>

                        <span>Camera off</span>
                    </div>
                ) : (
                    <video
                        ref={vidRef}
                        autoPlay
                        playsInline
                        muted
                    />
                )}
            </div>
        )}

        <div className="videoCall-options">

            <button
                className={`videoCall-option ${
                    isMuted ? "active" : ""
                }`}
                onClick={toggleMute}
            >
                <i
                    className={
                        isMuted
                            ? "fa-solid fa-microphone-slash"
                            : "fa-solid fa-microphone"
                    }
                />
            </button>

            <button
                className="videoCall-option end-call"
                onClick={onEndCall}
            >
                <i className="fa-solid fa-phone" />
            </button>

            {isVideoCall && (
                <button
                    className={`videoCall-option ${
                        isVideoOff ? "active" : ""
                    }`}
                    onClick={toggleVideo}
                >
                    <i
                        className={
                            isVideoOff
                                ? "fa-solid fa-video-slash"
                                : "fa-solid fa-video"
                        }
                    />
                </button>
            )}

        </div>

    </div>

    );
}
