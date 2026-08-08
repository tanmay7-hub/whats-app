import "./GroupAdd.css";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMembers } from "../../app/action/auth.action.js";
export function GroupAdd({ group , onBack }) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const auth = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
 
  const initUser = auth.allUser.filter(
     (u) => !group.members.some((member) => member._id === u._id)
  );
  const filteredUser = initUser.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );
  const handleUserClick = (user) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u._id == user._id)) {
        return prev.filter((u) => u._id !== user._id);
      }

      return [...prev, user];
    });
  };
  const handleAdd = async () => {
    setLoading(true);
    console.log(group);
    await dispatch(
      addMembers({
        groupId: group.id,
        members: selectedUsers.map((user) => user._id),
      }),
    );

    setLoading(false);
  };
  return (
    <>
      <div className="groupAdd-mainContainer">
        {/* search bar */}
        <div className="groupAdd-header">
          {/* back icon */}
          <div className="back-icon" onClick={onBack}>
            <i class="fa-solid fa-arrow-left"></i>
          </div>

          {/* search div */}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="AddMember-search-div"
            placeholder="Search"
          />
        </div>
        <div className="group-add-users">
          {filteredUser.map((user) => (
            <div
              className="group-add-user-card"
              key={user._id}
              onClick={() => handleUserClick(user)}
            >
              <div className="group-add-user-left">
                <img
                  className="group-add-user-image"
                  src={user.profilePic}
                  alt={user.username}
                />

                <p className="group-add-user-name">{user.username}</p>
              </div>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={selectedUsers.some((u) => u._id === user._id)}
                  onClick={(e) => e.stopPropagation()}
                />

                <span className="checkmark">
                  <i className="fa-solid fa-check"></i>
                </span>
              </label>
            </div>
          ))}
        </div>

        <div
          className={`add-icon ${
            selectedUsers.length === 0 || loading ? "disabled" : ""
          }`}
          onClick={selectedUsers.length > 0 && !loading ? handleAdd : undefined}
        >
          {loading ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            <i className ="fa-solid fa-user-plus"></i>
          )}
        </div>
      </div>
    </>
  );
}
