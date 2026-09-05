import "./inComingCall.css"
export default function InComingCall({caller , onEndCall , onAnswer}) {
    return (
        <>
            <div className="incomingCall-mainContainer">

                <div className="top-div">
                    <div className="profile-div">
                        <img src={caller.profilePic} />
                    </div>
                    <div className="incomingCall-info-div">
                        <p>{caller.name}  is Calling....</p>
                        <p>Video Call</p>
                    </div>
                </div>


                <div className="incomingCall-button">
                    <div>
                        <div className="icon">
                            <i class="fa-solid fa-x"></i>

                        </div>
                        <p>Decline</p>
                    </div>

                    <div>
                        <div className="icon">
                            <i class="fa-solid fa-check"></i>
                           
                        </div>
                         <p>Answer</p>
                    </div>
                </div>


            </div>
        </>
    );
};