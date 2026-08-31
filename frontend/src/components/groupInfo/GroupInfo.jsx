import "./GroupInfo.css";
import { createPortal } from "react-dom";
import { leaveGroup , removeMember} from "../../app/action/auth.action.js";
import { useState , useEffect , useRef} from "react";
import { useDispatch, useSelector } from "react-redux";

export function GroupInfo({
  group,
  onAddMember,
  onLeaveGroup,
  onCross,
  onEditClick,
  onUserClick,
}) {
  const [mode, setMode] = useState("view");
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);
  const groupInfoRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  
  const handleLeaveGroup = async () => {
    const data = {
      groupId: group.id,
    };

    await dispatch(leaveGroup(data));
    onLeaveGroup();
  };
  const handleRemove = async()=>{
    const data = { 
       groupId: group.id,
       memberId:selectedMember._id
     }
      await dispatch(removeMember(data));
            setMenuPosition(null);
            setSelectedMember(null);
     
  };
  const handleMakeAdmin = async()=>{

  }
  useEffect(() => {
    const handleClickOutside = (e) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(e.target)
        ) {
            setMenuPosition(null);
            setSelectedMember(null);
        }
    };

    const handleScroll = () => {
        setMenuPosition(null);
        setSelectedMember(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    const groupInfo = groupInfoRef.current;

    if (groupInfo) {
        groupInfo.addEventListener("scroll", handleScroll);
    }

    return () => {
        document.removeEventListener(
            "mousedown",
            handleClickOutside
        );

        if (groupInfo) {
            groupInfo.removeEventListener("scroll", handleScroll);
        }
    };
}, []);
   useEffect(() => {
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setMenuPosition(null);
          setSelectedMember(null);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  return (
    <>
      <div className="group-info" ref={groupInfoRef}>
        <div className="group-info-header">
          <div className="nameAndHeader">
            <div className="icon-div-editPage" onClick={onCross}>
              <i class="fa-solid fa-xmark"></i>
            </div>
            <p style={{ marginLeft: "1.3rem" }}>Group Info</p>
          </div>

          <div
            onClick={onEditClick}
            className="icon-div-editPage"
            style={{ marginRight: "1.1rem" }}
          >
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
            <div
              className="member-card"
              onClick={() => {
                onUserClick(member);
              }}
              key={member._id}
            >
              <div className="member-card-info">
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
              {group.admin.toString() === auth.UserId && member._id !== auth.UserId &&  <div
                className="three-dot"
                onClick={(e) => {
                  e.stopPropagation();
                  const menuWidth = 160;
                  const menuHeight = 100;
                  const gap = 8;

                  const spaceRight = window.innerWidth - e.clientX;
                  const spaceBottom = window.innerHeight - e.clientY;

                  let x;
                  let y = e.clientY;
                  if (spaceRight < menuWidth + gap) {
                    x = e.clientX - menuWidth - gap;
                  } else {
                    x = e.clientX + gap;
                  }

                 
                  if (spaceBottom < menuHeight) {
                    y = e.clientY - menuHeight;
                  }

                  setSelectedMember(member);

                  setMenuPosition({
                    x,
                    y,
                  });
                }}
              >
                {" "}
                <i class="fa-solid fa-ellipsis-vertical"></i>{" "}
              </div>}
            </div>
          );
        })}
        {  menuPosition &&
          selectedMember &&
          createPortal(
            <div
              className="admin-option-list"
              ref = {menuRef}
              style={{
                left: menuPosition.x,
                top: menuPosition.y,
              }}
            >
              <div className="admin-option" onClick = {handleMakeAdmin}>
                <i className="fa-solid fa-user-shield"></i>
                <span>Make Admin</span>
              </div>
              <div className="admin-option" onClick = {handleRemove}>
                <i className="fa-solid fa-user-minus"></i>
                <span>Remove</span>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </>
  );
}
