import {useState,useEffect,react} from 'react';
import { useNavigate } from "react-router-dom";
import axios from "../config/axios.js";
import {login} from "../app/action/auth.action.js"
import {useSelector,useDispatch} from "react-redux"

export default function Login(){


  const navigate = useNavigate();
  const [email,setemail] = useState("");
  const [password , setpassword] = useState("");
  //state and dispatcher
  const dispatch = useDispatch();
  const auth = useSelector((state)=>state.auth);

  const handleLogin = async()=>{
    try{
      console.log("logging in");
      dispatch(login({email,password}));
      setemail("");
      setpassword("");
    }catch(err){
       console.log(err);
    }
      
  }

  useEffect(()=>{
     const check = localStorage.getItem("token");
     console.log(check);
     if(check !== undefined)(navigate("/chat"));   
  },)
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
