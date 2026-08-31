import "./videoCall.css";
import { useRef, useState, useEffect } from "react";
import socket from "../../sockets/socket.js";
export function VideoCall({ isCaller , currentConvo}) {
  const vidRef = useRef(null);
  const remoteVidRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  // useEffect(() => {
  //   const handleAnswer = async (answer) => {    
  //      const peer = peerRef.current;  
  //     if (!peer) return;
  //     await peer.setRemoteDescription(answer);
  //   };
    
  
  //   socket.on("answer", handleAnswer);

  //   return () => {
  //     socket.off("answer", handleAnswer);
  //   };
  // }, []);
  // useEffect(() => {
  //   const handleOffer = async (offer) => {
  //     const peer = peerRef.current;

  //     if (!peer) {
  //       console.log("Peer not ready");
  //       return;
  //     }

  //     await peer.setRemoteDescription(offer);

  //     const answer = await peer.createAnswer();

  //     await peer.setLocalDescription(answer);

  //     socket.emit("answer", answer);
  //   };

  //   socket.on("offer", handleOffer);

  //   return () => {
  //     socket.off("offer", handleOffer);
  //   };
  // }, []);
  // useEffect(() => {
  //   const handleIceCandidate = async (candidate) => {
  //     const peer = peerRef.current;

  //     if (!peer) return;

  //     await peer.addIceCandidate(candidate);
  //   };
  //   socket.on("ice-candidate", handleIceCandidate);

  //   return () => {
  //     socket.off("ice-candidate", handleIceCandidate);
  //   };
  // }, []);
  // useEffect(() => {
  //   async function startCamera() {
  //     try {
  //       const initializePeer = async () => {
  //         streamRef.current = await navigator.mediaDevices.getUserMedia({
  //           video: true,
  //           audio: true,
  //         });

  //         if (vidRef.current) {
  //           vidRef.current.srcObject = streamRef.current;
  //         }

  //         const peer = new RTCPeerConnection();

  //         peerRef.current = peer;

  //         peer.ontrack = (event) => {
  //           if (remoteVidRef.current) {
  //             remoteVidRef.current.srcObject = event.streams[0];
  //           }
  //         };

  //         streamRef.current.getTracks().forEach((track) => {
  //           peer.addTrack(track, streamRef.current);
  //         });

  //         return { peer };
  //       };

  //       const { peer } = await initializePeer();
  //       peer.onicecandidate = (event) => {
  //         if (event.candidate) {
  //           socket.emit("ice-candidate", event.candidate);
  //         }
  //       };
  //       if (isCaller) {
  //         const offer = await peer.createOffer();
  //         await peer.setLocalDescription(offer);

  //         socket.emit("offer", {
  //           to: receiverId,
  //           offer: peer.localDescription,
  //         });
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  //   startCamera();

  //   return () => {
  //     if (stream)
  //       stream.getTracks().forEach((track) => {
  //         track.stop();
  //       });

  //     peerRef.current?.close();
  //   };
  // }, [isCaller]);
 
  useEffect(()=>{
    const getPeer = async()=>{
        const peer = await RTCPeerConnection();
        return peer;
    };
    peerRef.current = getPeer();

    
  },[]);
  return (
    <>
      <div className="call-main-container">
        <div className="remote-vid-div">
          <video
            ref={remoteVidRef}
            height="100%"
            width="100%"
            autoPlay
            playsInline
          />
          <div className="call-name"></div>

          <div className="video-div">
            <video ref={vidRef} muted autoPlay playsInline />
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
