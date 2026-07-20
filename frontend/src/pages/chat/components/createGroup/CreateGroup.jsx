import {useRef , useState , useEffect} from 'react';
import "./createGroup.css"
export  function CreateGroup ( {closeModal}){

const createGroupRef = useRef(null);

// closing the create group div
useEffect(()=>{
    const handleClickOutside= (e)=>{
          if (createGroupRef && !createGroupRef.current.contains(e.target)) {
            closeModal();
         }
    }

    document.addEventListener("mousedown" , handleClickOutside);

    return ()=>{
        document.removeEventListener("mousedown" , handleClickOutside );
    }
},[])
return (
        <div 
        ref = {createGroupRef}
        className="createGroupDiv" 
        >
           <div className = "mainContainer">
               <div className = "leftSide">
                      <div className = "profilePhotodiv"> 
                        
                      </div>

                      <div>
                         group name div 
                      </div>
                </div>
                <div className = "rightSide">
                      right side    
                </div>

           </div> 
           <div className = "createGroupbutton">
              <p> Create group </p>
           </div>
             
            
        </div>
  )
}