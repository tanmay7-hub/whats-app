import "./chat.css";
import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUser, getChat } from "../../app/action/auth.action.js";
import { setCurrUser } from "../../app/reducer/authReducer.js";
function Chat() {
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
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    messageEndRef.current.scrollIntoView({
      behavior: "auto",
    });
  });
  useEffect(() => {
    dispatch(getUser());
  }, []);

  const [Msg, setMsg] = useState("");
  const [search, setsearch] = useState("");

  const users = auth.allUser;
  const clickedUser = auth.clickedUser;
  const AllMessages = auth.currChat;

  const handleSearch = () => {
    console.log("search Clicked");
  };
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
             
              {auth.allUser &&
                users.map((user) => {
                  return (
                    <div
                      onClick={() => {
                        dispatch(
                          setCurrUser({
                           
                            currUserId: user._id,
                            currUserProfilePic:user.profilePic,
                            currUserIsOnline:user.isOnline,
                            currUserName: user.username,
                          }),
                        );
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
                <img src= {clickedUser.currUserProfilePic} />
                <div className="name-div">
                  <p>{ clickedUser.currUserName }</p>
                  <p>{ clickedUser.currUserIsOnline ? "online":""}</p>
                </div>
              </div>
            </div>
            <div className="messages-container">
               
                     <div className="initialStarting-div">
                        Start chat with a wave 👋
                     </div>
               
              
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
