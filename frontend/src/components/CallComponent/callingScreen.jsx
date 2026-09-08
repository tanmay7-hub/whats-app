import "./callingScreen.css";

export default function CallingScreen({
  caller,
  onEndCall,
}) {

  
  return (
    <div className="calling-main-container">

      <div className="calling-info">

        <div className="calling-profile-div">
          <img src={caller.profilePic} alt ={caller.username} />
        </div>

        <div className="calling-name">
          <p>{caller.name }</p>
        </div>

        <div className="calling-status">
          <p>Calling...</p>
        </div>

      </div>


      <div className="calling-button" onClick={onEndCall}>
        <div className="calling-icon">
          <i className="fa-solid fa-phone"></i>
        </div>

        <p>End call</p>
      </div>

    </div>
  );
}