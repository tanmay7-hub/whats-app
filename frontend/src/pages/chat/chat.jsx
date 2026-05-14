import "./chat.css";
import { useRef, useEffect, useState } from "react";
import {useSelector , useDispatch} from "react-redux"
import {getAllUser}from "../../app/action/auth.action.js"
function Chat() {
  const users = [
    {
      id: 1,
      name: "Rahul",
      profilePic: "https://i.pravatar.cc/150?img=1",
      lastMessage: "Hey bro",
      online: true,
    },
    {
      id: 2,
      name: "Priya",
      profilePic: "https://i.pravatar.cc/150?img=2",
      lastMessage: "Let's meet tomorrow",
      online: false,
    },
    {
      id: 3,
      name: "Aman",
      profilePic: "https://i.pravatar.cc/150?img=3",
      lastMessage: "Where are you?",
      online: true,
    },
    {
      id: 4,
      name: "Sneha",
      profilePic: "https://i.pravatar.cc/150?img=4",
      lastMessage: "Okay 👍",
      online: false,
    },
    {
      id: 5,
      name: "Rahul",
      profilePic: "https://i.pravatar.cc/150?img=1",
      lastMessage: "Hey bro",
      online: true,
    },
    {
      id: 6,
      name: "Priya",
      profilePic: "https://i.pravatar.cc/150?img=2",
      lastMessage: "Let's meet tomorrow",
      online: false,
    },
    {
      id: 7,
      name: "Aman",
      profilePic: "https://i.pravatar.cc/150?img=3",
      lastMessage: "Where are you?",
      online: true,
    },
    {
      id: 8,
      name: "Sneha",
      profilePic: "https://i.pravatar.cc/150?img=4",
      lastMessage: "Okay 👍",
      online: false,
    },
  ];
  const messages = [
    {
      id: 1,
      sender: "other",
      text: "Hey Tanmayorgrignorigjkbkjkvoirgnroignignign 👋",
      time: "10:20 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Hello Rahul!",
      time: "10:21 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "How's the project going?",
      time: "10:22 AM",
    },
    {
      id: 4,
      sender: "me",
      text: "Working on the chat UI currently 😄",
      time: "10:23 AM",
    },
    {
      id: 5,
      sender: "other",
      text: "Looks clean already",
      time: "10:24 AM",
    },
    {
      id: 6,
      sender: "me",
      text: "Still need to integrate sockets",
      time: "10:25 AM",
    },
    {
      id: 7,
      sender: "other",
      text: "That'll make it feel real-time",
      time: "10:26 AM",
    },
  ];
  const messageEndRef = useRef(null);
  const dispatch = useDispatch();


  useEffect(() => {
    messageEndRef.current.scrollIntoView({
      behavior: "auto",
    });
  });
  useEffect(()=>{
    dispatch(getAllUser());
  })
    
  const [Msg, setMsg] = useState("");
  const [search, setsearch] = useState("");



  

  const handleSearch =()=>{
       console.log("search Clicked");
  }
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
                }}
                value={search}
              />
              <i class="fa-brands fa-sistrix"></i>
            </div>
            <div className="chat-Users-div">
              {users.map((user) => {
                return (
                  <div className="user-side-div">
                    <div className="profile-wrapper">
                      <img src={user.profilePic} />
                      {user.online && <div className="online-dot"></div>}
                    </div>

                    <div className="userName-chat-div">
                      <p> {user.name}</p>
                      <p>{user.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chat-right-div">
            <div className="chat-header">
              <div className="chat-user-info">
                <img src="https://i.pravatar.cc/150?img=1" />
                <div className="name-div">
                  <p>Rahul</p>
                  <p>Online</p>
                </div>
              </div>
            </div>
            <div className="messages-container">
              {messages.map((m) => {
                return (
                  <div
                    className={
                      m.sender == "me" ? "my-message" : "other-message"
                    }
                  >
                    <p>{m.text}</p>
                    <span>{m.time}</span>
                  </div>
                );
              })}
              <div ref={messageEndRef}></div>
            </div>
            <div className="message-input-div">
              <input
                type="text"
                placeholder="Type a message..."
                onChange={(e) => {
                  setMsg(e.target.value);
                }}
                value={Msg}
              />
              <button onClick={handleSearch}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Chat;
