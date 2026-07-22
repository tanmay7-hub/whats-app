import { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./createGroup.css";
export function CreateGroup({ closeModal }) {
  const [profilePhoto, setProfilePhoto] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
  );
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const createGroupRef = useRef(null);
  
  
  const auth = useSelector((state) => state.auth);
  const loggedInUserId = auth.loggedInUser.userId;
  const users = auth.allUser.filter(user => user._id !== loggedInUserId);
 


  const handleCreateGroup = ()=>{
      
  };
  const filteredUsers = users.filter(
    (user) => !selectedUsers.some((selected) => selected._id === user._id),
  );
  const handleRemoveUser = (id) => {
    setSelectedUsers((prev) => {
      return prev.filter((user) => user._id !== id);
    });
  };
  const handleUserSelected = (user) => {
    setSelectedUsers((prev) => {
      if (prev.some(u => u._id === user._id))
          return prev;
      return [...prev, user];
    });
  };

  // closing the create group div
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createGroupRef.current && !createGroupRef.current.contains(e.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={createGroupRef} className="createGroupDiv">
      <div className="mainContainer">
        <div className="leftSide">
          <div style={{ overflow: "hidden" }} className="profilePhotodiv">
            <input 
            type="file"
            id="groupPhoto"
            onChange={(e)=>{
                const file = e.target.files[0];
                if(!file)return;
               setProfilePhoto(
                URL.createObjectURL(file)
               );
            }}
            hidden 
            />
            <label htmlFor="groupPhoto">
              <img className="profilePhoto" src={profilePhoto} />
            </label>
          </div>

          <div className="groupNameDiv">
            <p>Group name : </p>
            <input
              id="group-name"
              onChange={(e) => {
                setGroupName(e.target.value);
              }}
              value={groupName}
              placeholder="Ex:- Study , Friends , Colony  . "
            />
          </div>
        </div>
        <div className="rightSide">
          <div className="selectedUser">
            {selectedUsers &&
              selectedUsers.map((user) => {
                return (
                  <span 
                  className="selectedUserSpan"
                  onClick={() => handleRemoveUser(user._id)}
                  key={user._id}
                  >
                    
                    {user.username} &nbsp;
                    <p >✖</p>
                  </span>
                );
              })}
          </div>
          <div className="UsersList">
            {filteredUsers &&
              filteredUsers.map((user) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                    key={user._id}
                  >
                    <div
                      className="filteredUserDiv"
                      onClick={() => {
                        handleUserSelected(user);
                      }}
                    >
                      <img src={user.profilePic} />
                      <p>{user.username}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <button className="createGroupbutton"
      onClick ={()=>{
        handleCreateGroup();
      }}
      disabled={
        groupName.trim() === "" ||
        selectedUsers.length === 0
       }
      >
         Create group 
      </button>
    </div>
  );
}
