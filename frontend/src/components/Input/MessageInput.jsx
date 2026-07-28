import { AudioRecorder } from "./AudioRecorder";
import { useRef } from "react";
export function MessageInput({ Msg,
  setMsg,
  Image,
  setImage,
  ImagePreview,
  setImagePreview,
  conversation,
  socket,
  auth,
  handleSend,
  isRecording,
  setIsRecording,}) {
    
  const timer = useRef(null);
  return (
    <div className="message-input-div">
      <div className="message-input-upper-div">
        {ImagePreview !== null && <img src={ImagePreview} />}
      </div>

      <div className="message-input-lower-div">
        {!isRecording && (
          <>
            <input
              type="file"
              id="imageInput"
              style={{ display: "none" }}
              onChange={(e) => {
                setImage(e.target.files[0]);
                setImagePreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
            <label htmlFor="imageInput" className="upload-btn">
              <i className="fa-solid fa-paperclip"></i>
            </label>
            <input
              type="text"
              placeholder="Type a message..."
              onChange={(e) => {
                clearTimeout(timer.current);
                if (conversation.type === "user") {
                  socket.emit("user-typing", {
                    receiverId: conversation.id,
                    senderId: auth.UserId,
                  });
                } else {
                  socket.emit("group-typing", {
                    groupId: conversation.id,
                    senderId: auth.UserId,
                  });
                }

                timer.current = setTimeout(() => {
                  if (conversation.type === "user") {
                    socket.emit("stop-typing", {
                      senderId: auth.UserId,
                      receiverId: conversation.id,
                    });
                  } else {
                    socket.emit("stop-group-typing", {
                      senderId: auth.UserId,
                      groupId: conversation.id,
                    });
                  }
                }, 1000);

                setMsg(e.target.value);
              }}
              disabled={isRecording}
              value={Msg}
            />
            <button onClick={handleSend}>Send</button>
          </>
        )} 
          <AudioRecorder
             showRecorder={Msg === ""}
             onAudioRecorded={(blob) => handleSend(blob)}
             isRecording = {isRecording}
             setIsRecording = {setIsRecording}
          />
        
      </div>
    </div>
  );
}
