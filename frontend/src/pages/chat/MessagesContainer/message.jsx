function MessagesContainer({AllMessages,handleSend}){
    const messageEndRef = useRef(null);
    useEffect(()=>{
        messageEndRef.current.scrollIntoView({
         behavior: "auto",
    });
    })
   return (
    <>
            <div className="messages-container">
               
                     <div className="initialStarting-div">
                        Start chat with a wave 👋
                     </div>
               
              
              {AllMessages !== undefined && AllMessages.map((m) => {
                return (
                  <div
                    className={
                      m.senderId ===clickedUser.currUserId ? "other-message" : "my-message"
                    }
                  >
                    <p>{m.message}</p>
                    <span>10:12AM</span>
                  </div>
                );
              })}
              <div ref={messageEndRef}></div>
            </div>

    </>
   )
}
export default MessagesContainer;