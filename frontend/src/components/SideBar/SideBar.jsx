export function SideBar ( {
    auth,
    search,
    setSearch,
    showProfileMenu,
    setShowProfileMenu,
    showCreateGroup,
    setShowCreateGroup,
    menuRef,
    logout,
    tabs,
    currTab,
    setCurrTab,
    filteredUsers,
    groups,
    dispatch,
    setChatNull,
    setCurrentConversation,
    getChat,
    getGroupChat,
    socket,
    setMsg,
    setImage,
    setImagePreview,
}){
    return(
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
    );
}