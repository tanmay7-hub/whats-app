import MusicPlayer from "../musicPlayer/musicPlayer";
import {useState , useEffect} from "react"
import socket from "../../sockets/socket.js"
export function MessageContainer({
  auth,
  AllMessages,
  conversation,
  typingUserId,
  messageEndRef,
  onReply
}) {
  const [menuMessage, setMenuMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [reactionMenu, setReactionMenu] = useState(null);

  const handleDeleteForEveryone = async () => {
    socket.emit("delete-message", {
      msgId: menuMessage._id,
    });
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
    const closeMenu = () => {
      setMenuPosition(null);
      setMenuMessage(null);
    };
    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
    };
  }, []);
  const handleReply = () => {
    onReply(menuMessage);
    setMenuPosition(null);
    setReactionMenu(null);
  };
  return (
    <div className="messages-container">
      {AllMessages.length === 0 && (
        <div className="initialStarting-div">Start chat with a wave 👋</div>
      )}

      {AllMessages !== undefined &&
        AllMessages.map((m, idx) => {
          const prev = AllMessages[idx - 1];

          const showSender =
            conversation.type === "group" &&
            (idx === 0 || prev.senderId._id !== m.senderId._id);
          // const sameSenderAsPrevious = idx > 0 && prev.senderId._id === m.senderId._id && prev.senderId._id !== auth.UserId;
          return m.senderId._id !== auth.UserId ? (
            <div className={`group-message-wrapper`}>
              {conversation.type === "group" && (
                <div key={m._id} className="group-avatar-container">
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
              className={`${
                m.senderId._id === auth.UserId ? "my-message" : "other-message"
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
                    {new Date(m.createdAt).toLocaleTimeString().substring(0, 5)}

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

          {!(menuMessage.senderId._id !== auth.UserId) && (
            <div className="context-option" onClick={handleDeleteForEveryone}>
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

      {typingUserId && (
        <div className="typing-div other-message">
          <p>Typing...</p>
        </div>
      )}

      <div ref={messageEndRef}></div>
    </div>
  );
}
