import "./chat.css";
import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import clientServer from "../../config/axios.js";
import MusicPlayer from "../../components/musicPlayer/musicPlayer.jsx"
import {
  getUser,
  getChat,
  sendMessage,
  getCurrUser,
} from "../../app/action/auth.action.js";
import {
  setCurrUser,
  setChatNull,
  addMessage,
  updateDeliveryStatus,
  updateMessageSeenStatus,
  UnreadIncrement,
} from "../../app/reducer/authReducer.js";
import MessageContainer from "./MessagesContainer/message.jsx";
import socket from "../../sockets/socket.js";
import chatwall from "../../assets/chat-wall.png";
import { formatTime } from "../../utils/timer.js";
function Chat() {
  const messageEndRef = useRef(null);
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [Msg, setMsg] = useState("");
  const [search, setsearch] = useState("");
  const [Image, setImage] = useState(null);
  const [ImagePreview, setImagePreview] = useState(null);
  const [typingUserId, settypingUserId] = useState(null);
  const [Send, setSend] = useState(false);
  const [isRecording, setisRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const audioRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const users = auth.allUser;
  const clickedUser = auth.clickedUser;
  const AllMessages = auth.currChat;
  const timer = useRef(null);
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );

  const getImageUrl = async () => {
    const formData = new FormData();

    formData.append("image", Image);
    const res = await clientServer.post("/upload-image", formData);
    console.log("res:", res.data);
    return res.data.imageUrl;
  };
  const getAudioUrl = async () => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    const res = await clientServer.post("/upload-audio", formData);

    console.log(res.data);
    return res.data.audioUrl;
  };

  const handleSend = async () => {
    if (Send) return;
    if (Msg == "" && Image == null && audioBlob == null) return;
    setSend(true);
    let ImageUrl = null;
    let audioUrl = null;
    if (Image) {
      ImageUrl = await getImageUrl();
    }
    if (audioBlob) {
      audioUrl = await getAudioUrl();
    }

    socket.emit("msg-send", {
      message: Msg,
      image: ImageUrl,
      audio: audioUrl,
      receiverId: clickedUser.currUserId,
      senderId: auth.UserId,
    });
    setMsg("");
    setImage(null);
    setImagePreview(null);
    setSend(false);
    setAudioBlob(null);
  };

  const startAudioRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const recorder = new MediaRecorder(stream);

    audioRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorder.start();
    setisRecording(true);
  };
  const stopAudioRecording = async () => {
    const recorder = audioRecorderRef.current;

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(audioBlob);
    };
    recorder.stop();
    setisRecording(false);
    handleSend();
  };
  useEffect(() => {
    socket.on("msg-sent", (data) => {
      dispatch(addMessage(data));
    });
    return () => {
      socket.off("msg-sent");
    };
  }, []);
  useEffect(() => {
    if (localStorage.getItem("token") == null) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    socket.on("refresh-users", () => {
      dispatch(getUser());
    });
    return () => {
      socket.off("refresh-users");
    };
  }, []);
  useEffect(() => {
    if (localStorage.getItem("token") !== null) {
      dispatch(getUser());
      if (auth.userClicked) {
        messageEndRef.current.scrollIntoView({
          behavior: "auto",
        });
      }
    }
  }, [auth.currChat]);
  //details about curr user
  useEffect(() => {
    if (localStorage.getItem("token") !== null) {
      dispatch(getCurrUser());
    }
  }, []);

  //user fetching
  useEffect(() => {
    if (auth.UserId !== undefined) {
      socket.connect();
      socket.emit("user-logged-in", { id: auth.UserId });
    }
  }, [auth.UserId]);
  //receiving message from socket
  useEffect(() => {
    socket.on("receive-message", (data) => {
      if (clickedUser.currUserId === data.senderId) {
        dispatch(addMessage(data));

        socket.emit("msg-delivered", {
          messageId: data._id,
          senderId: data.senderId,
        });

        socket.emit("chat-opened", {
          senderId: data.senderId,
          receiverId: data.receiverId,
        });
      } else {
        dispatch(UnreadIncrement(data));
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [clickedUser.currUserId]);

  //typing indicator
  useEffect(() => {
    const handleTyping = (data) => {
      settypingUserId(data.senderId);
      messageEndRef.current.scrollIntoView({
        behavior: "auto",
      });
    };
    const stopTyping = (data) => {
      settypingUserId(null);
    };
    socket.on("user-typing", handleTyping);
    socket.on("stop-typing", stopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("stop-typing", stopTyping);
    };
  }, []);
  // delivery status updating in ui
  useEffect(() => {
    socket.on("message-delivered", (data) => {
      //dispatch here the updating function in ui
      dispatch(updateDeliveryStatus({ messageId: data.messageId }));
    });

    return () => {
      socket.off("message-delivered");
    };
  }, []);
  // msg seen update
  useEffect(() => {
    socket.on("update-seen", async (data) => {
      console.log("udpate called");
      console.log("sender:", typeof clickedUser.currUserId);
      console.log("receiver:", typeof data.receiverId);
      if (data.receiverId === clickedUser.currUserId) {
        dispatch(updateMessageSeenStatus(data));
      }
    });
    return () => {
      socket.off("update-seen");
    };
  }, [clickedUser.currUserId]);

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="logo-div">
            <div className="icons-div-chat">
              <i className=" icons-chat fa-brands fa-telegram"></i>
            </div>
            <p className="header-heading">Let's Chat!</p>
          </div>

          <div className="logo-div">
            <div className="icons-div-chat">
              <i class="icons-chat fa-solid fa-bell"></i>
              <i class="icons-chat fa-solid fa-gear"></i>
            </div>
          </div>
        </div>
        <div className="main-container">
          <div className="chat-left-div">
            <div className="chat-search-bar">
              <input
                className="chat-search"
                placeholder="  Search "
                type="text"
                onChange={(e) => {
                  setsearch(e.target.value);
                  handleSearch();
                }}
                value={search}
              />
              <i class="fa-brands fa-sistrix"></i>
            </div>
            <div className="chat-Users-div">
              {filteredUsers.map((user) => {
                if (user._id !== auth.UserId)
                  return (
                    <div
                      onClick={() => {
                        dispatch(setChatNull());

                        dispatch(
                          setCurrUser({
                            currUserLastSeen: user.lastSeen,
                            currUserId: user._id,
                            currUserProfilePic: user.profilePic,
                            currUserIsOnline: user.isOnline,
                            currUserName: user.username,
                          }),
                        );
                        socket.emit("chat-opened", {
                          senderId: user._id,
                        });
                        dispatch(getChat({ reqId: user._id }));
                      }}
                      className="user-side-div"
                    >
                      <div className="profile-wrapper">
                        <img src={user.profilePic} />
                        {user.isOnline && <div className="online-dot"></div>}
                      </div>

                      <div className="userName-chat-div">
                        <p> {user.username}</p>
                        <p
                          style={{
                            fontWeight: user.unreadCount > 0 ? "600" : "400",
                            color: user.unreadCount > 0 ? "#0f0101e8" : "#777",
                          }}
                        >
                          {user.lastMessage}
                        </p>
                      </div>
                      {user.unreadCount > 0 && (
                        <div className="unread-badge">{user.unreadCount}</div>
                      )}
                    </div>
                  );
              })}
            </div>
          </div>
          {auth.userClicked && (
            <div className="chat-right-div">
              <div className="chat-header">
                <div className="chat-user-info">
                  <img src={clickedUser.currUserProfilePic} />
                  <div className="name-div">
                    <p>{clickedUser.currUserName}</p>
                    <p>
                      {clickedUser.currUserIsOnline
                        ? "online"
                        : clickedUser.currUserLastSeen === null
                          ? ""
                          : `Last seen ${formatTime(clickedUser.currUserLastSeen)}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="messages-container">
                {auth.currChat.length === 0 && (
                  <div className="initialStarting-div">
                    Start chat with a wave 👋
                  </div>
                )}

                {AllMessages !== undefined &&
                  AllMessages.map((m) => {
                    return (
                      <div
                        className={`${
                          m.senderId === clickedUser.currUserId
                            ? "other-message"
                            : "my-message"
                        } ${m.audioUrl ? "audio-bubble" : ""}`}
                      >
                        {m.audioUrl && (
                          <div className="audio-message">
                            <MusicPlayer audioUrl={m.audioUrl} />
                            
                          </div>
                        )}
                        {m.imageUrl && <img src={m.imageUrl} />}
                        <p>{m.message}</p>
                        <div className="message-meta">
                          {new Date(m.createdAt)
                            .toLocaleTimeString()
                            .substring(0, 5)}

                          {m.senderId !== clickedUser.currUserId &&
                            (m.seen ? (
                              <i className="fa-solid fa-check-double seen-tick"></i>
                            ) : m.delivered ? (
                              <i className="fa-solid fa-check-double"></i>
                            ) : (
                              <i className="fa-solid fa-check"></i>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                {typingUserId == clickedUser.currUserId && (
                  <div className="typing-div other-message">
                    <p>Typing...</p>
                  </div>
                )}
                <div ref={messageEndRef}></div>
              </div>

              <div className="message-input-div">
                <div className="message-input-upper-div">
                  {Image !== null && <img src={ImagePreview} />}
                </div>
                <div className="message-input-lower-div">
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
                    {" "}
                    <i className="fa-solid fa-paperclip"></i>
                  </label>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    onChange={(e) => {
                      clearTimeout(timer.current);
                      socket.emit("user-typing", {
                        senderId: auth.UserId,
                        receiverId: clickedUser.currUserId,
                      });

                      timer.current = setTimeout(() => {
                        socket.emit("stop-typing", {
                          senderId: auth.UserId,
                          receiverId: clickedUser.currUserId,
                        });
                      }, 1000);
                      setMsg(e.target.value);
                    }}
                    disabled={isRecording}
                    value={Msg}
                  />
                  <button onClick={handleSend}>Send</button>
                  {Msg === "" && (
                    <div
                      className="audio-div"
                      onClick={() => {
                        if (isRecording) {
                          stopAudioRecording();
                        } else {
                          startAudioRecording();
                        }
                      }}
                    >
                      {" "}
                      {isRecording ? (
                        <i class="fa-solid fa-stop"></i>
                      ) : (
                        <i className="fa-solid fa-microphone"></i>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {!auth.userClicked && (
            <div className="chat-right-div-initial">
              <img className="chat-wall" src={chatwall} />
              <h2>No chat selected</h2>
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default Chat;
