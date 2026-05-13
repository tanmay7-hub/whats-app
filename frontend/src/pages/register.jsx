import {useState,useEffect,react} from 'react';

 function Register(){
   const [Username,setUsername] = useState("");
   const [Email, setEmail] = useState("");
   const [Password ,setPassword] =useState("");

   const submitForm =()=>{
       if(Username == "" || Email=="" || Password =="" ){
         return ;
       }

       console.log("registering you");
       setUsername("");
       setEmail("");
       setPassword("");
   }

   return (
    <>
      <div className="container"> 
            <div className ="main-div">
               <div className ="left-div">
                   <h1 className="heading">Sign  in</h1>
                   <div className="icons-div">  
                        <i class="icons  fa-brands fa-facebook"></i>
                   
                        <i class="icons fa-brands fa-google"></i>
                  
                        <i class="icons fa-brands fa-instagram"></i>            
                   </div>
                   <p>or use your account</p>

                   <div className = "input-div">
                     <input className="input" placeholder="Username" />
                     <input className="input" placeholder="Email" />
                     <input  type ="password" className="input" placeholder="Password" />
                   </div>
                   <p className="forget-p">forget your password ?</p>
                   <div className="signIn-div">
                     Sign In
                   </div>
                   
               </div>
               <div className ="right-div">
                   <h1>Hello, Friend!</h1>
                   <p>
                       Enter you personal details and start journey with us.
                   </p>
                   <div className="signUp-div">
                      Sign UP
                   </div>

               </div>
            </div>

      </div>
    </>
   );
}
export default Register;
