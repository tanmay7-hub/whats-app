import "./UserProfile.css";

export function UserProfile({ user, onCross }) {
  return (
    <div className="user-profile">

      
      <div className="user-profile-header">
        <div
          className="user-profile-back"
          onClick={onCross}
        >
           <i class="fa-solid fa-xmark"></i>
        </div>

        <p> User Info </p>
      </div>

      
      <div className="user-profile-main">

        <div className="user-profile-image">
          <img
            src={user.profilePic}
            alt={user.username}
          />
        </div>

        <p className="user-profile-name">
          {user.name || user.username}
        </p>

      </div>

      <div className="user-profile-actions">

        <div className="user-profile-action" onClick ={onCross}>
          <div className="user-profile-action-icon">
            <i className="fa-solid fa-message"></i>
          </div>
          <p>Message</p>
        </div>

        <div className="user-profile-action">
          <div className="user-profile-action-icon">
            <i className="fa-solid fa-phone"></i>
          </div>
          <p>Call</p>
        </div>

        <div className="user-profile-action">
          <div className="user-profile-action-icon">
            <i className="fa-solid fa-video"></i>
          </div>
          <p>Video</p>
        </div>

      </div>

    </div>
  );
}