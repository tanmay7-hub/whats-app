import "./GroupInfo.css"
export function GroupInfo({group}){
    return (

        <div className ="group-info">
             <div className = "group-info-header">
                   <div ><i class="fa-solid fa-xmark"></i></div>
                   
                   <p>Group Info</p>
             </div>
             <div className = "profile-div">
                 <img src ={group.profilePic}/>
                 <p>{group.name}</p>
             </div>
             { group.members.map((member)=>{
                
                return (
                     <div className ="member-card"> 
                          <div className="pic">  
                             <img src = {member.profilePic}/>
                             
                          </div>
                          <p>{member.username}</p>
                    </div>
                );

             })}

        </div>
    );
}