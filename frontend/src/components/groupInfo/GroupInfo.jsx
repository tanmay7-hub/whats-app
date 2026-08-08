import "./GroupInfo.css";
import { leaveGroup } from "../../app/action/auth.action.js";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function GroupInfo({ group, onAddMember, onLeaveGroup, onCross , onEditClick , onUserClick }) {
  const [mode, setMode] = useState("view");
  const dispatch = useDispatch();
  const handleLeaveGroup = async () => {
    const data = {
      groupId: group.id,
    };

    await dispatch(leaveGroup(data));
    onLeaveGroup();
  };
  return (
    <>
      <div className="group-info">
        <div className="group-info-header">
          <div className = "nameAndHeader">
            <div className="icon-div-editPage" onClick={onCross}>
              <i class="fa-solid fa-xmark"></i>
            </div>
            <p  style= {{marginLeft : "1.3rem"}}>Group Info</p>
          </div>

          <div onClick = {onEditClick} className="icon-div-editPage" style= {{marginRight : "1.1rem"}}>
            <i class="fa-solid fa-user-pen"></i>
          </div>
        </div>

        <div className="profile-div">
          <img src={group.profilePic} />
          <p>{group.name}</p>
          <span>{group.members.length} members</span>
        </div>

        <div className="action-div">
          <div className="action-card">
            <div className="icon-circle">
              <i className="fa-solid fa-phone"></i>
            </div>
            <p>Call</p>
          </div>

          <div className="action-card">
            <div className="icon-circle" onClick={handleLeaveGroup}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>
            <p>Leave</p>
          </div>

          <div className="action-card">
            <div className="icon-circle" onClick={onAddMember}>
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <p>Add</p>
          </div>
        </div>
        {group.members.map((member) => {
          return (
            <div className="member-card" onClick={() => onUserClick(member)}  key={member._id}>
              <div className="pic">
                <img src={member.profilePic} />
              </div>

              <div className="member-info">
                <p>{member.username}</p>

                {group.admin.toString() === member._id && (
                  <span className="admin-block">Admin</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
