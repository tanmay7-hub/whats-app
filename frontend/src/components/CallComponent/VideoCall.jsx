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
      if (!peer) {
        return;
      }

      await peer.setRemoteDescription(offer);
      for (const candidate of pendingIceCandidatesRef.current) {
        await peer.addIceCandidate(candidate);
      }
      pendingIceCandidatesRef.current = [];
      const answer = await peer.createAnswer();

      await peer.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
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
      console.log("start camera ");
      try {
        const initializePeer = async () => {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          if (vidRef.current) {
            vidRef.current.srcObject = streamRef.current;
          }

          const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });

          peerRef.current = peer;

          peer.ontrack = (event) => {

            const [remoteStream] = event.streams;
            
            remoteVidRef.current.srcObject = remoteStream;
          };

          streamRef.current.getTracks().forEach((track) => {
            peer.addTrack(track, streamRef.current);
          });

          return { peer };
        };

        const { peer } = await initializePeer();

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

        
      </div>
    </>
  );
}
