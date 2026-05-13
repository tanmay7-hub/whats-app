import {useState,useEffect,react} from 'react';
import { useNavigate } from "react-router-dom";
import axios from "../config/axios.js"

export default function Login(){
  const navigate = useNavigate();
  const [email,setemail] = useState("");
  const [password , setpassword] = useState("");

  const handleLogin = async()=>{
    try{
      console.log("logging in");
      const res = await axios.post("/login",{email,password});
      console.log(res);

      setemail("");
      setpassword("");
      
      navigate("/chat");
      
      
    }catch(err){
       console.log(err);
    }
      
  }
   return (
    <>
     <div className="container"> 
            <div className ="main-div">
               <div className ="left-div">
                   <h1 className="heading">Welcome Backkkk!!!!</h1>
                   <div className="icons-div">  
                        <i class="icons fa-brands fa-facebook"></i>
                   
                        <i class="icons fa-brands fa-google"></i>
                  
                        <i class="icons fa-brands fa-instagram"></i>            
                   </div>
                   <p>or use your account</p>

                   <div className = "input-div">
                     <input onChange={(e)=>setemail(e.target.value)}  value ={email} className="input" placeholder="Email" />
                     <input onChange={(e)=>setpassword(e.target.value)} value ={password} className="input" placeholder="Password" />
                   </div>
                   <p className="forget-p">forget your password ?</p>
                   <div  onClick={handleLogin} className="signIn-div">
                     Sign In
                   </div>
                   
               </div>
               <div className ="right-div">
                   <h1>Hello, Friend!</h1>
                   <p>
                       Enter you personal details and start journey with us.
                   </p>
                   <div className="signUp-div">
                      Sign IN
                   </div>

               </div>
            </div>

      </div>
    </>
   );
}
