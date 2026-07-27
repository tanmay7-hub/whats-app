export function ReplyPreview({replyMessage , auth , setReplyMessage , conversation}){
    return(
        <>
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
              </>
    );
}