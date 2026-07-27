import { formatTime } from "../../utils/timer.js";
export function ChatHeader({conversation}){
    return (
            <div className="chat-header">
                <div className="chat-user-info">
                  <img src={conversation.profilePic} />
                  <div className="name-div">
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
              </div>
    );
}