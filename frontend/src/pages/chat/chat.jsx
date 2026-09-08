import "./chat.css";
import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import clientServer from "../../config/axios.js";
import { createPortal } from "react-dom";
import MusicPlayer from "../../components/musicPlayer/musicPlayer.jsx";
import InComingCall from "../../components/CallComponent/inComingCall.jsx"
import CallingScreen from "../../components/CallComponent/callingScreen.jsx"
import { CreateGroup } from "../../components/createGroup/CreateGroup.jsx";
import { CSSTransition } from "react-transition-group";
import { VideoCall } from "../../components/CallComponent/VideoCall.jsx";
import {
  getUser,
  getAllGroups,
  getChat,
  sendMessage,
  getCurrUser,
  getGroupChat,
} from "../../app/action/auth.action.js";
import {
  setChatNull,
  addMessage,
  updateDeliveryStatus,
  updateMessageSeenStatus,
  UnreadIncrement,
  deleteMessage,
  updateReaction,
  setCurrentConversation,
  updateClickedStatus,
} from "../../app/reducer/authReducer.js";
import MessageContainer from "../../components/MessagesContainer/message.jsx";
import socket from "../../sockets/socket.js";
import chatwall from "../../assets/chat-wall.png";
import { formatTime } from "../../utils/timer.js";
import { GroupInfo } from "../../components/groupInfo/GroupInfo.jsx";
import { GroupEdit } from "../../components/groupEdit/GroupEdit";
import { UserProfile } from "../../components/userProfile/UserProfile.jsx";
import { GroupAdd } from "../../components/GroupAdd/GroupAdd.jsx";
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
  const [groupModalMode, setGroupModalMode] = useState("create");
  const createGroupRef = useRef(null);
  const menuRef = useRef(null);
  const users = auth.allUser;
  const conversation = auth.currentConversation;
  const AllMessages = auth.currChat;
  const timer = useRef(null);
  const [showGroupEdit, setShowGroupEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupPage, setGroupPage] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isCaller, setIsCaller] = useState(false);
  const [isVideoCall , setIsVideoCall] = useState(false);


  const [showCallingScreen, setShowCallingScreen] = useState(false);
  const [incomingCallDetail, setIncomingCallDetail] = useState(null);
  const [showIncomingScreen, setShowIncomingScreen] = useState(false);
  const [callData, setCallData] = useState(null);
  const tabs = ["Chats", "Groups", "Calls"];

  const handleBack = () => {
    setShowGroupEdit(false);
  };
  const handleUpdateGroup = async ({ name, image }) => {
    let imageUrl = conversation.profilePic;

    if (image) {
      imageUrl = await getImageUrl(image);
    }

    dispatch(
      updateGroup({
        groupId: conversation.id,
        name,
        groupImage: imageUrl,
      }),
    );
  };
  const handleRemoveMember = (member) => {
    dispatch(
      removeMember({
        groupId: conversation.id,
        memberId: member._id,
      }),
    );
  };
  const handleAddMembers = (selectedUsers) => {
    dispatch(
      addMembers({
        groupId: conversation.id,
        members: selectedUsers.map((user) => user._id),
      }),
    );
  };
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
  // video call ui from here
  useEffect(() => {
    const handleIncomingCall = (data) => {
      setIncomingCallDetail(data);
      setShowIncomingScreen(true);
      setIsVideoCall(data.isVideoCall);
    };
    socket.on("incoming-call", handleIncomingCall);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
    }
  }, [])

  const handleEndCall = () => {
    
    setShowCallingScreen(false);   
    setShowVideoCall(false);
    const to = (isCaller == true)  ? callData.id : incomingCallDetail.id;

    console.log(to);
    socket.emit("call-end", {
      to
    });
    
      setIsCaller(false);
      setCallData(null);
      
      setIncomingCallDetail(null);
      setShowIncomingScreen(false);
    
  }

  useEffect(() => {
    const handleCallEnd = () => {
        setShowCallingScreen(false);
        setShowVideoCall(false);

        setIsCaller(false);
        setCallData(null);
        setIncomingCallDetail(null);
        setShowIncomingScreen(false);
      
    };
    socket.on("call-end", handleCallEnd);

    return () => {
      socket.off("call-end", handleCallEnd);
    }

  }, []);
  const handleClickedVoiceCall = ()=>{
        setIsVideoCall(false);
        const data = auth.currentConversation;

    setCallData(data);
    setIsCaller(true);
    setShowCallingScreen(true);

    socket.emit("call-user", {
      to: data.id,
      caller: {
        id: auth.loggedInUser.userId,
        name: auth.loggedInUser.name,
        profilePic: auth.loggedInUser.profilePic,
        isVideoCall
      }
    });
  }
  const handleClickedVideoCall = () => {
    setIsVideoCall(true);
    const data = auth.currentConversation;

    setCallData(data);
    setIsCaller(true);
    setShowCallingScreen(true);

    socket.emit("call-user", {
      to: data.id,
      caller: {
        id: auth.loggedInUser.userId,
        name: auth.loggedInUser.name,
        profilePic: auth.loggedInUser.profilePic,
        isVideoCall
      }
    });

  }
  const handleClickedReject = () => {
    setShowIncomingScreen(false);
    socket.emit("call-rejected", {
      to: incomingCallDetail.id
    });
    setIncomingCallDetail(null);
  };
  useEffect(() => {
    const handleCallAccepted = () => {
      setIsCaller(true);
      setShowCallingScreen(false);
      setShowVideoCall(true);
    };
    const handleCallRejected = () => {
      setCallData(null);
      setShowCallingScreen(false);
      setShowVideoCall(false);
    }
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    return () => {
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
    }

  }, []);
  const handleVideoCallAnswer = () => {
    socket.emit("call-accepted", {
      to: incomingCallDetail.id
    });

    setShowIncomingScreen(false);
    setIsCaller(false);
    setShowVideoCall(true);
  };

  // till here



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
      replyTo = replyTo = {
        _id: replyMessage._id,
        senderId: replyMessage.senderId._id,
        senderName: replyMessage.senderId.username,
        message: replyMessage.message,
        imageUrl: replyMessage.imageUrl,
        audioUrl: replyMessage.audioUrl,
        type: replyMessage.audioUrl
          ? "audio"
          : replyMessage.imageUrl
            ? "image"
            : "text",
      };
    }
    if (conversation.type === "user") {
      socket.emit("msg-send", {
        receiverId: conversation.id,
        message: Msg,
        image: ImageUrl,
        audio: audioUrl,
        senderId: auth.UserId,
        replyTo,
      });
    } else {
      socket.emit("group-msg-send", {
        groupId: conversation.id,
        message: Msg,
        image: ImageUrl,
        audio: audioUrl,
        senderId: auth.UserId,
        replyTo,
      });
    }
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
      setReactionMenu(null);
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
      console.log("msg-sent", data);
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
    socket.on("refresh-users", async () => {
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
      if (conversation.type === "user" && conversation.id === data.senderId) {
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
    socket.on("receive-group-message", (data) => {
      if (conversation.type === "group" && conversation.id === data.groupId) {
        console.log("receive-group-message", data);
        dispatch(addMessage(data));
      } else {
        dispatch(groupUnreadIncrement(data));
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("receive-group-message");
    };
  }, [conversation.id, conversation.type]);

  //typing indicator
  useEffect(() => {
    const handleTyping = (data) => {
      settypingUserId(data.senderId);

      messageEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
    };

    const handleStopTyping = () => {
      settypingUserId(null);
    };

    socket.on("user-typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    socket.on("group-typing", handleTyping);
    socket.on("stop-group-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);

      socket.off("group-typing", handleTyping);
      socket.off("stop-group-typing", handleStopTyping);
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
    socket.on("update-seen", (data) => {
      if (conversation.type === "user" && conversation.id === data.receiverId) {
        dispatch(updateMessageSeenStatus(data));
      }
    });
    return () => {
      socket.off("update-seen");
    };
  }, [conversation.id, conversation.type]);
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
                      logout();
                    }}
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
              {currTab === 0 &&
                filteredUsers.map((user) => {
                  if (user._id !== auth.UserId)
                    return (
                      <div
                        key={user._id}
                        onClick={() => {
                          dispatch(setChatNull());
                          setMsg("");
                          setImage(null);
                          setImagePreview(null);
                          setGroupPage("");
                          dispatch(
                            setCurrentConversation({
                              type: "user",
                              id: user._id,
                              name: user.username,
                              profilePic: user.profilePic,
                              isOnline: user.isOnline,
                              lastSeen: user.lastSeen,
                              members: [],
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
                              color:
                                user.unreadCount > 0 ? "#0f0101e8" : "#777",
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
              {currTab === 1 &&
                groups.map((group) => {
                  return (
                    <div
                      // key={group._id}
                      onClick={() => {
                        dispatch(
                          setCurrentConversation({
                            type: "group",
                            admin: group.admin,
                            id: group._id,
                            name: group.name,
                            profilePic: group.groupImage,
                            members: group.members,
                          }),
                        );

                        dispatch(getGroupChat(group._id));
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
                })}
            </div>
          </div>
          {auth.userClicked && (
            <div className="chat-right-div">
              <div className="chat-header">
                <div className="chat-user-info">
                  <img src={conversation.profilePic} />
                  <div
                    className="name-div"
                    onClick={() => {
                      if (conversation.type === "group") {
                        setGroupPage("info");
                      } else {
                        setSelectedUser(conversation);
                        setGroupPage("user");
                      }
                    }}
                  >
                    <p>{conversation.name}</p>
                    <p>
                      {conversation.type === "user"
                        ? conversation.isOnline
                          ? "online"
                          : conversation.lastSeen == null
                            ? ""
                            : `Last seen ${formatTime(conversation.lastSeen)}`
                        : `${conversation.members.length} members`}
                    </p>
                  </div>
                </div>
                <div className="call-icons">
                  <div className="call-icon"onClick={handleClickedVoiceCall}>
                    <i class="fa-solid fa-phone"></i>
                  </div>
                  <div
                    onClick={handleClickedVideoCall}
                    className="call-icon"
                  >
                    <i class="fa-solid fa-video"></i>
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
                  AllMessages.map((m, idx) => {
                    const prev = AllMessages[idx - 1];

                    const showSender =
                      conversation.type === "group" &&
                      (idx === 0 || prev.senderId._id !== m.senderId._id);
                    return m.senderId._id !== auth.UserId ? (
                      <div className={`group-message-wrapper`}>
                        {conversation.type === "group" && (
                          <div className="group-avatar-container">
                            {showSender && (
                              <img
                                src={m.senderId.profilePic}
                                className="group-message-profile"
                              />
                            )}
                          </div>
                        )}
                        <div
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
                          className={`other-message ${m.audioUrl ? "audio-bubble" : ""}`}
                        >
                          {showSender && (
                            <div className="group-message-name">
                              {m.senderId.username}
                            </div>
                          )}

                          {!m.deletedforEveryone && m.replyTo && (
                            <div className="reply-preview">
                              <div className="reply-line"></div>

                              <div className="reply-content">
                                <div className="reply-header">
                                  {m.replyTo.senderId.toString() === auth.UserId
                                    ? "You"
                                    : m.replyTo.senderName}
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

                                {m.senderId._id === auth.UserId &&
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
                        </div>
                      </div>
                    ) : (
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
                        className={`${m.senderId._id === auth.UserId
                          ? "my-message"
                          : "other-message"
                          } ${m.audioUrl ? "audio-bubble" : ""}`}
                      >
                        {!m.deletedforEveryone && m.replyTo && (
                          <div className="reply-preview">
                            <div className="reply-line"></div>

                            <div className="reply-content">
                              <div className="reply-header">
                                {m.replyTo.senderId.toString() === auth.UserId
                                  ? "You"
                                  : m.replyTo.senderName}
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

                              {m.senderId._id === auth.UserId &&
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
                    );
                  })}
                {menuPosition &&
                  createPortal(
                    <div
                      className="context-menu"
                      // style={{
                      //   left: menuPosition.x,
                      //   top: menuPosition.y,
                      // }}
                      style={{
                        position: "fixed",
                        left: `${menuPosition.x}px`,
                        top: `${menuPosition.y}px`,
                      }}
                    >
                      <div className="context-option" onClick={handleReply}>
                        <i className="fa-solid fa-reply"></i>
                        <span>Reply</span>
                      </div>

                      {!(menuMessage.senderId._id !== auth.UserId) && (
                        <div
                          className="context-option"
                          onClick={handleDeleteForEveryone}
                        >
                          <i class="fa-solid fa-trash-can"></i>
                          <span>Delete</span>
                        </div>
                      )}
                    </div>,
                    document.body,
                  )}
                {reactionMenu &&
                  createPortal(
                    <div
                      // style={{
                      //   left: reactionMenu.x,
                      //   top: reactionMenu.y,
                      // }}
                      style={{
                        position: "fixed",
                        left: `${reactionMenu.x}px`,
                        top: `${reactionMenu.y}px`,
                      }}
                      className="reaction-div"
                    >
                      {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(
                        (emoji, idx) => {
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
                        },
                      )}
                    </div>,
                    document.body,
                  )}

                {typingUserId && (
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
                      {replyMessage.senderId._id === auth.UserId
                        ? "You"
                        : replyMessage.senderId.username}
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
          )}

          {!auth.userClicked && (
            <div className="chat-right-div-initial">
              <img className="chat-wall" src={chatwall} />
              <h2>No chat selected</h2>
              <p>Select a user to start chatting</p>
            </div>
          )}

          {groupPage !== "" && conversation && conversation.members && (
            <div className="group-pages">
              <div
                className={`page ${groupPage === "info" ? "active" : "left"}`}
              >
                <GroupInfo
                  group={conversation}
                  onAddMember={() => setGroupPage("add")}
                  onUserClick={(user) => {
                    setSelectedUser(user);
                    setGroupPage("user");
                  }}
                  onCross={() => {
                    setGroupPage("");
                  }}
                  onEditClick={() => setGroupPage("edit")}
                  onLeaveGroup={() => {
                    setGroupPage("");
                    dispatch(updateClickedStatus());
                  }}
                />
              </div>

              <div
                className={`page ${groupPage === "add" ? "active" : "right"}`}
              >
                <GroupAdd
                  group={conversation}
                  onCross={() => {
                    setGroupPage("");
                  }}
                  onBack={() => setGroupPage("info")}
                />
              </div>

              <div
                className={`page ${groupPage === "edit" ? "active" : "right"}`}
              >
                <GroupEdit
                  group={conversation}
                  onBack={() => setGroupPage("info")}
                  onCross={() => {
                    setGroupPage("");
                  }}
                />
              </div>
              <div
                className={`page ${groupPage === "user" ? "active" : "right"}`}
              >
                {selectedUser && (
                  <UserProfile
                    user={selectedUser}
                    onCross={() => setGroupPage("")}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {showCreateGroup && (
          <div className="modal-overlay">
            <CreateGroup
              closeModal={() => {
                setShowCreateGroup(false);
              }}
              changeTab={(num) => {
                setCurrTab(num);
              }}
            />
          </div>
        )}

        {showVideoCall && (
          <div className="modal-overlay">
            <VideoCall
              isCaller = {isCaller}
              currentConvo = {isCaller ? auth.currentConversation : incomingCallDetail}
              onEndCall = {handleEndCall}
              isVideoCall = {isVideoCall}
            />
          </div>
        )}


        {showCallingScreen && <div className="modal-overlay">
          <CallingScreen
            caller = {auth.currentConversation}
            onEndCall = {handleEndCall}
          />
        </div>}

        {showIncomingScreen && <div className="modal-overlay">
          <InComingCall
            caller = {incomingCallDetail}
            onEndCall = {handleClickedReject}
            onAnswer = {handleVideoCallAnswer}
          />
        </div>}

      </div>
    </>
  );
}
export default Chat;
