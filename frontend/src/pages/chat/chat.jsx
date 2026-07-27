import "./chat.css";
import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import clientServer from "../../config/axios.js";
import MusicPlayer from "../../components/musicPlayer/musicPlayer.jsx";
import { InfoDrawer } from "../../components/Info/InfoDrawer.jsx";
import { UserInfo } from "../../components/Info/UserInfo.jsx";
import { GroupInfo } from "../../components/Info/GroupInfo.jsx";
import { SideBar } from "../../components/SideBar/SideBar.jsx";
import { CreateGroup } from "../../components/createGroup/CreateGroup.jsx";
import { ChatHeader } from "../../components/ChatHeader/ChatHeader.jsx";
import { ReplyPreview } from "../../components/Input/Reply.jsx";
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
} from "../../app/reducer/authReducer.js";
import {MessageContainer} from "../../components/MessageContainer/MessageContainer.jsx";
import socket from "../../sockets/socket.js";
import chatwall from "../../assets/chat-wall.png";
import { formatTime } from "../../utils/timer.js";
import { MessageInput } from "../../components/Input/MessageInput.jsx";
function Chat() {
  const messageEndRef = useRef(null);
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [Msg, setMsg] = useState("");
  const [Image, setImage] = useState(null);
  const [search, setsearch] = useState("");
  const [typingUserId, settypingUserId] = useState(null);
  const [Send, setSend] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [currTab, setCurrTab] = useState(0);
  const [replyMessage, setReplyMessage] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const createGroupRef = useRef(null);
  const menuRef = useRef(null);
  const users = auth.allUser;
  const conversation = auth.currentConversation;
  const AllMessages = auth.currChat;

  const tabs = ["Chats", "Groups", "Calls"];

  const groups = auth.allGroups;
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );
  
  
  useEffect(() => {
    const handler = async (data) => {
      dispatch(updateReaction(data));
    };
    socket.on("reaction-updated", handler);

    return () => {
      socket.off("reaction-updated", handler);
    };
  }, []);

  const getImageUrl = async () => {
    const formData = new FormData();
    formData.append("image", Image);
    const res = await clientServer.post("/upload-image", formData);

    return res.data.imageUrl;
  };
  const getAudioUrl = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob);

    const res = await clientServer.post("/upload-audio", formData);
    return res.data.audioUrl;
  };
 
  const handleSend = async (recordedBlob = null) => {
    if (Send) return;
    const blob = recordedBlob ?? audioBlob;

    if (Msg === "" && Image == null && blob == null) return;
    setSend(true);
    let ImageUrl = null;
    let replyTo = null;
    let audioUrl = null;
    if (Image) {
      ImageUrl = await getImageUrl();
    }
    if (blob) {
      audioUrl = await getAudioUrl(blob);
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
        <SideBar
          auth={auth}
          search={search}
          setSearch={setsearch}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          showCreateGroup={showCreateGroup}
          setShowCreateGroup={setShowCreateGroup}
          menuRef={menuRef}
          logout={logout}
          tabs={tabs}
          currTab={currTab}
          setCurrTab={setCurrTab}
          filteredUsers={filteredUsers}
          groups={groups}
          dispatch={dispatch}
          setChatNull={setChatNull}
          setCurrentConversation={setCurrentConversation}
          getChat={getChat}
          getGroupChat={getGroupChat}
          socket={socket}
          setMsg={setMsg}
          setImage={setImage}
          setImagePreview={setImagePreview}
        />
        {auth.userClicked && (
          <div className="chat-right-div">
            <ChatHeader conversation={conversation} />
            
            <MessageContainer
              AllMessages={AllMessages}
              conversation={conversation}
              auth={auth}
              typingUserId={typingUserId}
              messageEndRef={messageEndRef}
             
            />
            <ReplyPreview
              replyMessage={replyMessage}
              conversation={conversation}
              auth={auth}
              setReplyMessage={setReplyMessage}
            />
            <MessageInput
              Msg={Msg}
              setMsg={setMsg}
              Image={Image}
              setImage={setImage}
              ImagePreview={ImagePreview}
              setImagePreview={setImagePreview}
              conversation={conversation}
              socket={socket}
              auth={auth}
              handleSend={handleSend}
              timer={timer}
              handleSend={handleSend}
            />
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

      <InfoDrawer onClose={() => setShowInfo(false)}>
        {conversation.type === "user" ? <UserInfo /> : <GroupInfo />}
      </InfoDrawer>
    </div>
  );
}
export default Chat;
