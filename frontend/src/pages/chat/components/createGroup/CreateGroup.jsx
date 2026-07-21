import { useRef, useState, useEffect } from "react";
import {useSelector , useDispatch} from 'react-redux'
import "./createGroup.css";
export function CreateGroup({ closeModal }) {


  const [profilePhoto, setProfilePhoto] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
  );
  const [groupName, setGroupName] = useState("");
  const [selectedUser , setSelectedUser ] = useState([]);
  const createGroupRef = useRef(null);

  const auth = useSelector(state => state.auth);
  
  const users = auth.allUser;
  let filteredUser = users; 
  const handleUserSelected = (user)=>{
          filteredUser = filteredUser.filter(u => u._id === user._id  );
          setSelectedUser((prev) => {
            return [...prev , user];
          });
  }
  
  // closing the create group div
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createGroupRef && !createGroupRef.current.contains(e.target)) {
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
            <input type="file" id="groupPhoto" hidden />
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
              value = {groupName}
              placeHolder ="Ex:- Study , Friends , Colony  . "
            />
          </div>
        </div>
        <div className="rightSide">
            
            <div className = "selectedUser">
                 {selectedUser && selectedUser.map(user=>{
                   return(  <span className ="selectedUserSpan" > {user.name } &nbsp; <p >✖</p></span>)
                 })}
            </div>
            <div className = "UsersList">
               {filteredUser && filteredUser.map(user =>{
                   return(
                     <div style ={{display:"flex" , flexDirectiom:"row" , justifyContent:"space-between"}}>
                      <div className = "filteredUserDiv"
                       onClick={()=>{
                         handleUserSelected(user);
                       }}
                      >
                          <img  src = {user.profilePic}/>
                          <p>{user.username}</p>
                      </div>

                      
                      </div>
            
                      
                   )
               })}
            </div>
        </div>
      </div>
      <div className="createGroupbutton">
        <p> Create group </p>
      </div>
    </div>
  );
}
