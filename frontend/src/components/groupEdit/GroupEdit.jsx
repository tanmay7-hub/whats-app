import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {updateGroup} from "../../app/action/auth.action.js"
import clientServer from "../../config/axios.js";
import "./GroupEdit.css";

export function GroupEdit({ group, onBack, onCross }) {
  const [profilePhoto, setProfilePhoto] = useState(group.profilePic);
  const [groupName, setGroupName] = useState(group.name);
  const [profileFile, setProfileFile] = useState(null);
  const [isLoading , setIsloading] = useState(false);
  const dispatch = useDispatch();
  
  const getImageUrl = async () => {
    if(!profileFile)return group.profilePic;
    if (
      profilePhoto ===
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
    )
      return profilePhoto;
    const formData = new FormData();
    formData.append("image", profileFile);
    const res = await clientServer.post("/upload-image", formData);

    return res.data.imageUrl;
  };
  const onSave = async () => {
  try {
    setIsloading(true);
    const image = await getImageUrl();
  //  groupId, name, groupImage
    const data = {
      groupId: group.id,
      name:groupName,
      groupImage : image,
    }; 
     await dispatch(updateGroup(data));
     setIsloading(false);
     onBack();

  } catch (err) {
    console.error("Failed to update group:", err);
  }
};
  return (
    <>
      <div className="Group-edit">
        {/* header */}
        <div className="group-info-header">
          <div className="nameAndHeader">
            <div className="icon-div-editPage" onClick={onBack}>
             <i class="fa-solid fa-arrow-left"></i>
            </div>
            <p style={{ marginLeft: "1.3rem" }}>Group Edit</p>
          </div>

          <div
            onClick={onSave}
            className="icon-div-editPage"
            style={{ marginRight: "1.1rem", fontSize: "1.2rem" }}
          >
           {isLoading === true ? <i className="fa-solid fa-spinner fa-spin"></i>: <i className="fa-solid fa-floppy-disk"></i>}
          </div>
        </div>

        {/* edit profile photo */}

        <div className="profile-photo-wrapper">
          <input
            type="file"
            id="groupPhoto"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files[0];

              if (!file) return;

              if (
                !["image/jpeg", "image/png", "image/webp"].includes(file.type)
              ) {
                alert("Please select a JPG, PNG, or WEBP image.");
                return;
              }

              setProfileFile(file);
              setProfilePhoto(URL.createObjectURL(file));
            }}
          />

          <label htmlFor="groupPhoto" className="profile-photo-label">
            <img className="profilePhoto" src={profilePhoto} alt="Group" />

            <div className="photo-hover-overlay">
              <div className="edit-photo-icon">
                <i className="fa-solid fa-pen"></i>
              </div>
            </div>
          </label>
        </div>

        {/* edit name of group */}
        <div className="group-name-input">
          <input
            type="text"
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            
          />

          <label htmlFor="group-name">Group name</label>
        </div>

        {/* member list */}
      </div>
    </>
  );
}
