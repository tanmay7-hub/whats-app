import "./chat.css";
import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import clientServer from "../../config/axios.js";
import MusicPlayer from "../../components/musicPlayer/musicPlayer.jsx";
import { CreateGroup } from "./components/createGroup/CreateGroup.jsx";
import {
  getUser,
  getAllGroups,
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
  deleteMessage,
  updateReaction,
} from "../../app/reducer/authReducer.js";
import MessageContainer from "./components/MessagesContainer/message.jsx";
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
  const [liveWaveform, setLiveWaveform] = useState([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [currTab, setCurrTab] = useState(0);
  const [replyMessage, setReplyMessage] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [reactionMenu, setReactionMenu] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const createGroupRef = useRef(null);
  const menuRef = useRef(null);
  const users = auth.allUser;
  const clickedUser = auth.clickedUser;
  const AllMessages = auth.currChat;
  const timer = useRef(null);

  
  const tabs = ["Chats", "Groups", "Calls"];

  const groups = auth.allGroups;
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );
  

  const handleReply = () => {
    setReplyMessage(menuMessage);
    setMenuPosition(null);
    setReactionMenu(null);
  };
  const handleReaction = (message, emoji) => {
    const payload = {
      emoji: emoji,
      messageId: message._id,
    };
    socket.emit("emoji-reaction", payload);
    setReactionMenu(null);
    setMenuPosition(null);
    setMenuMessage(null);
  };
  useEffect(() => {
    const handler = async (data) => {
      dispatch(updateReaction(data));
    };
    socket.on("reaction-updated", handler);

    return () => {
      socket.off("reaction-updated", handler);
    };
  }, []);
  const formattedTime = (time) => {
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return formattedTime;
  };
  const getImageUrl = async () => {
    const formData = new FormData();

    formData.append("image", Image);
    const res = await clientServer.post("/upload-image", formData);

    return res.data.imageUrl;
  };
  const getAudioUrl = async () => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    const res = await clientServer.post("/upload-audio", formData);

    return res.data.audioUrl;
  };
  const handleDeleteForEveryone = async () => {
    socket.emit("delete-message", {
      msgId: menuMessage._id,
    });
  };
  const handleSend = async () => {
    if (Send) return;
    if (Msg == "" && Image == null && audioBlob == null) return;
    setSend(true);
    let ImageUrl = null;
    let replyTo = null;
    let audioUrl = null;
    if (Image) {
      ImageUrl = await getImageUrl();
    }
    if (audioBlob) {
      audioUrl = await getAudioUrl();
    }

    if (replyMessage) {
      replyTo = {
        _id: replyMessage._id,
        senderId: replyMessage.senderId,
        message: replyMessage.message,
        type: replyMessage.audioUrl
          ? "audio"
          : replyMessage.imageUrl
            ? "image"
            : "text",
      };
    }
    socket.emit("msg-send", {
      message: Msg,
      image: ImageUrl,
      audio: audioUrl,
      receiverId: clickedUser.currUserId,
      senderId: auth.UserId,
      replyTo,
    });
    setReplyMessage(null);
    setMsg("");
    setImage(null);
    setImagePreview(null);
    setSend(false);
    setAudioBlob(null);
  };

  const startAudioRecording = async () => {
    setLiveWaveform([]);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    audioContextRef.current = audioContext;
    source.connect(analyser);
    audioRecorderRef.current = recorder;
    chunksRef.current = [];

    const updateWaveform = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      analyser.getByteTimeDomainData(dataArray);

      let mx = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const distance = Math.abs(dataArray[i] - 128);

        mx = Math.max(mx, distance);
      }

      const amplitude = mx / 128;

      setLiveWaveform((prev) => {
        const next = [...prev, amplitude];
        if (next.length > 70) {
          next.shift();
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(updateWaveform);
    };

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    updateWaveform();
    recorder.start();
    setisRecording(true);
  };
  const stopAudioRecording = async () => {
    const recorder = audioRecorderRef.current;

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      await setAudioBlob(audioBlob);
    };
    streamRef.current?.getTracks().forEach((track) => track.stop());
    cancelAnimationFrame(animationRef.current);
    audioContextRef.current?.close();

    recorder.stop();
    setisRecording(false);
    handleSend();
  };

  useEffect(() => {
    socket.on("message-deleted", (data) => {
      dispatch(deleteMessage(data));
    });

    return () => {
      socket.off("message-deleted");
    };
  }, []);
  useEffect(() => {
    const closeMenu = () => {
      setMenuPosition(null);
      setMenuMessage(null);
    };
    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
    
    };
  }, []);
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
  //all groups and users
  useEffect(() => {
    socket.on("refresh-users",async() => {
      await dispatch(getUser());
      await dispatch(getAllGroups());
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
      if (data.receiverId === clickedUser.currUserId) {
        dispatch(updateMessageSeenStatus(data));
      }
    });
    return () => {
      socket.off("update-seen");
    };
  }, [clickedUser.currUserId]);
  //menu close effect in useRef
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <>
      <div className="container">
        {/* <div className="header">
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
        </div> */}
        <div className="main-container">
          <div className="chat-left-div">
            <div className="chat-search-bar">
              <div
                className="profile-div"
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <img src={auth.loggedInUser.profilePic} />
              </div>
              <input
                className="chat-search"
                placeholder=" 🔍  Search "
                type="text"
                onChange={(e) => {
                  setsearch(e.target.value);
                }}
                value={search}
              />

              {/* profile menu */}
              {showProfileMenu && (
                <div className="profile-optionDiv" ref={menuRef}>
                  {/* My profile button */}
                  <div
                    className="profile-option"
                    onClick={() => {
                      setShowProfileMenu(false);
                    }}
                  >
                    <i class="fa-regular fa-circle-user"></i>
                    My Profile
                  </div>

                  {/* setting button */}
                  <div
                    className="profile-option"
                    onClick={() => {
                      setShowProfileMenu(false);
                    }}
                  >
                    <i class="fa-solid fa-gear"></i>
                    Settings
                  </div>

                  {/* create group button  */}
                  <div
                    className="profile-option"
                    onClick={() => {
                      setShowCreateGroup(true);
                      setShowProfileMenu(false);
                    }}
                  >
                    <i class="fa-solid fa-user-group"></i>
                    Create Group
                  </div>

                  {/* logout button */}
                  <div
                    className="profile-option logout"
                    onClick={() => {
                      setShowProfileMenu(false);
                    }}
                    onClick={logout}
                  >
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    Logout
                  </div>
                </div>
              )}
            </div>
            <div className="switching-tab">
              {tabs.map((tab, index) => (
                <div
                  key={tab}
                  className={`tab ${currTab === index ? "active" : ""}`}
                  onClick={() => setCurrTab(index)}
                >
                  {tab}
                </div>
              ))}
            </div>
            <div className="chat-Users-div">
              { currTab === 0 && filteredUsers.map((user) => {
                if (user._id !== auth.UserId)
                  return (
                    <div
                      key={user._id}
                      onClick={() => {
                        dispatch(setChatNull());
                        setMsg("");
                        setImage(null);
                        setImagePreview(null);
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
              { currTab === 1 && groups.map((group) =>{
                   return (
                    <div
                      key={group._id}
                      onClick={() => {
                        dispatch(setChatNull());
                        setMsg("");
                        setImage(null);
                        setImagePreview(null);
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
                        <img src={group.groupImage} />
                        
                      </div>

                      <div className="userName-chat-div">
                        <p> {group.name}</p>
                        <p
                          style={{
                            fontWeight: group.unreadCount > 0 ? "600" : "400",
                            color: group.unreadCount > 0 ? "#0f0101e8" : "#777",
                          }}
                        >
                          {group.lastMessage}
                        </p>
                      </div>
                      {group.unreadCount > 0 && (
                        <div className="unread-badge">{group.unreadCount}</div>
                      )}
                    </div>
                  );
              })

              }
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
                      <>
                        <div
                          key={m._id}
                          onContextMenu={(e) => {
                            if (m.deletedforEveryone) return;
                            e.preventDefault();
                            setMenuMessage(m);
                            setMenuPosition({
                              x: e.clientX + 15,
                              y: e.clientY - 5,
                            });

                            setReactionMenu({
                              x: e.clientX + 15,
                              y: e.clientY - 65,
                            });
                          }}
                          className={`${
                            m.senderId === clickedUser.currUserId
                              ? "other-message"
                              : "my-message"
                          } ${m.audioUrl ? "audio-bubble" : ""}`}
                        >
                          {!m.deletedforEveryone && m.replyTo && (
                            <div className="reply-preview">
                              <div className="reply-line"></div>

                              <div className="reply-content">
                                <div className="reply-header">
                                  {m.replyTo.senderId === auth.UserId
                                    ? "You"
                                    : clickedUser.currUserName}
                                </div>

                                <div className="reply-text">
                                  {m.replyTo.message.length > 0
                                    ? m.replyTo.message
                                    : m.replyTo.type != "audio"
                                      ? "📷 Photo"
                                      : "🎵 Voice Message"}
                                </div>
                              </div>
                            </div>
                          )}
                          {!m.deletedforEveryone && (
                            <div style={{ position: "relative" }}>
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
                          )}
                          {m.deletedforEveryone && (
                            <div className="deleted-message">
                              <i>This message was deleted</i>
                            </div>
                          )}
                          {!m.deletedforEveryone && m.reactions?.length > 0 && (
                            <div className="reaction-container">
                              {Object.entries(
                                m.reactions.reduce((acc, r) => {
                                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                  return acc;
                                }, {}),
                              ).map(([emoji, count]) => (
                                <span>
                                  {emoji} {count}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })}
                {menuPosition && (
                  <div
                    className="context-menu"
                    style={{
                      left: menuPosition.x,
                      top: menuPosition.y,
                    }}
                  >
                    <div className="context-option" onClick={handleReply}>
                      <i className="fa-solid fa-reply"></i>
                      <span>Reply</span>
                    </div>

                    {!(menuMessage.senderId !== auth.UserId) && (
                      <div
                        className="context-option"
                        onClick={handleDeleteForEveryone}
                      >
                        <i class="fa-solid fa-trash-can"></i>
                        <span>Delete</span>
                      </div>
                    )}
                  </div>
                )}
                {reactionMenu && (
                  <div
                    style={{
                      left: reactionMenu.x,
                      top: reactionMenu.y,
                    }}
                    className="reaction-div"
                  >
                    {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji, idx) => {
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            handleReaction(menuMessage, emoji);
                          }}
                          className="emoji-div"
                        >
                          {emoji}
                        </div>
                      );
                    })}
                  </div>
                )}

                {typingUserId == clickedUser.currUserId && (
                  <div className="typing-div other-message">
                    <p>Typing...</p>
                  </div>
                )}

                <div ref={messageEndRef}></div>
              </div>

              {replyMessage && (
                <div className="reply-preview">
                  <div className="reply-line"></div>

                  <div className="reply-content">
                    <div className="reply-header">
                      {replyMessage.senderId === auth.UserId
                        ? "You"
                        : clickedUser.currUserName}
                    </div>

                    <div className="reply-text">
                      {replyMessage.message.length > 0
                        ? replyMessage.message
                        : replyMessage.audioUrl == null
                          ? "📷 Photo"
                          : "🎵 Voice Message"}
                    </div>
                  </div>

                  <div
                    className="reply-close"
                    style={{ cursor: "pointer" }}
                    onClick={() => setReplyMessage(null)}
                  >
                    ✕
                  </div>
                </div>
              )}
              <div className="message-input-div">
                <div className="message-input-upper-div">
                  {Image !== null && <img src={ImagePreview} />}
                </div>

                <div className="message-input-lower-div">
                  {!isRecording ? (
                    <>
                      <input
                        type="file"
                        id="imageInput"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          setImage(e.target.files[0]);
                          setImagePreview(
                            URL.createObjectURL(e.target.files[0]),
                          );
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
                    </>
                  ) : (
                    <div className="recording-ui">
                      <div className="recording-indicator">🎤 Recording...</div>

                      <div className="live-waveform">
                        {liveWaveform.map((amp, idx) => (
                          <div
                            key={idx}
                            className="wave-bar"
                            style={{
                              height: `${Math.max(7, amp * 70)}px`,
                            }}
                          />
                        ))}
                      </div>

                      <div>{formattedTime(recordingTime)}</div>
                    </div>
                  )}

                  {Msg === "" && (
                    <div
                      className="audio-div"
                      onClick={() => {
                        if (isRecording) {
                          stopAudioRecording();
                          clearInterval(timerRef.current);
                        } else {
                          startAudioRecording();
                          setRecordingTime(0);

                          timerRef.current = setInterval(() => {
                            setRecordingTime((prev) => prev + 1);
                          }, 1000);
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
           )
          }
         
          {!auth.userClicked && (
            <div className="chat-right-div-initial">
              <img className="chat-wall" src={chatwall} />
              <h2>No chat selected</h2>
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>

        {showCreateGroup && (
          <div className="modal-overlay">
            <CreateGroup
              closeModal={() => {
                setShowCreateGroup(false);
              }}
              changeTab ={(num)=>{
                 setCurrTab(num);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
export default Chat;
