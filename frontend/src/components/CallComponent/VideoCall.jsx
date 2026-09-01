import "./videoCall.css";
import { useRef, useState, useEffect } from "react";
import socket from "../../sockets/socket.js";
export function VideoCall({ isCaller, currentConvo }) {
  const vidRef = useRef(null);
  const remoteVidRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const pendingIceCandidatesRef = useRef([]);
  useEffect(() => {
    const handleAnswer = async (answer) => {
      console.log("ANSWER RECEIVED BY", socket.id);
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
      console.log("OFFER RECEIVED BY", socket.id);
      const peer = peerRef.current;
      if (!peer) {
        console.log("Peer not ready");
        return;
      }

      await peer.setRemoteDescription(offer);
      for (const candidate of pendingIceCandidatesRef.current) {
        await peer.addIceCandidate(candidate);
      }
      pendingIceCandidatesRef.current = [];
      const answer = await peer.createAnswer();

      await peer.setLocalDescription(answer);

      console.log("ANSWER EVENT EMITTED BY ", socket.id);
      socket.emit("answer", { to: from, answer });
    };

    socket.on("offer", handleOffer);

    return () => {
      socket.off("offer", handleOffer);
    };
  }, []);
  useEffect(() => {
    const handleIceCandidate = async (candidate) => {
      console.log("ICE EVENT RECEIVED BY ", socket.id);
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
        const initializePeer = async () => {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          if (vidRef.current) {
            vidRef.current.srcObject = streamRef.current;
          }

          const peer = new RTCPeerConnection();

          peerRef.current = peer;

          peer.ontrack = (event) => {
            console.log("REMOTE TRACK RECEIVED");
            console.log("kind:", event.track.kind);

            const video = remoteVidRef.current;
            const remoteStream = event.streams[0];

            if (!video || !remoteStream) return;

            console.log("Remote tracks:", remoteStream.getTracks());

            if (video.srcObject === remoteStream) {
              console.log("Stream already attached");
              return;
            }

            video.srcObject = remoteStream;

            video.onloadedmetadata = () => {
              console.log("REMOTE METADATA LOADED");
              console.log("Dimensions:", video.videoWidth, video.videoHeight);

              video
                .play()
                .then(() => {
                  console.log("REMOTE VIDEO PLAYING");
                })
                .catch((err) => {
                  console.error("REMOTE VIDEO PLAY ERROR:", err);
                });
            };
          };

          streamRef.current.getTracks().forEach((track) => {
            console.log("SENDER VIDEO TRACK", {
              enabled: track.enabled,
              readyState: track.readyState,
              muted: track.muted,
            });
            peer.addTrack(track, streamRef.current);
          });

          return { peer };
        };

        const { peer } = await initializePeer();

        peer.onconnectionstatechange = () => {
          console.log("Connection state:", peer.connectionState);
        };

        peer.oniceconnectionstatechange = () => {
          console.log("ICE state:", peer.iceConnectionState);
        };

        peer.onsignalingstatechange = () => {
          console.log("Signaling state:", peer.signalingState);
        };
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("ICE EVENT EMITTED BY:", socket.id);
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

          console.log("OFFER SENDING TO:", currentConvo.id);
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
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

      peerRef.current?.close();
    };
  }, [isCaller]);
  return (
    <>
      <div className="call-main-container">
        <div className="remote-vid-div">
          <video
            ref={remoteVidRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
          <div className="call-name"></div>

          <div className="video-div">
            <video
              ref={vidRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              muted
              autoPlay
              playsInline
            />
          </div>

          <div className="button">
            <div>
              {" "}
              <i className="fa-solid fa-microphone-slash"></i>{" "}
            </div>
            <div>
              {" "}
              <i className="fa-solid fa-phone"></i>{" "}
            </div>
            <div>
              {" "}
              <i className="fa-solid fa-video-slash"></i>{" "}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
