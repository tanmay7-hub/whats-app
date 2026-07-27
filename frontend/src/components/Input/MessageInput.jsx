import { AudioRecorder } from "./AudioRecorder";

export function MessageInput() {
    
    const [ImagePreview, setImagePreview] = useState(null);
  return (
    <div className="message-input-div">
      <div className="message-input-upper-div">
        {Image !== null && <img src={ImagePreview} />}
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
          />
        
      </div>
    </div>
  );
}
