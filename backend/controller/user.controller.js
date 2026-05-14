import User from '../models/user.model.js'
import Message from "../models/message.model.js"
import bcrypt  from 'bcrypt'
import jwt from 'jsonwebtoken';



export const getAllUser = async (req,res)=>{
   try{
      const allUser = await User.find({});
       return res.json(200).json({data:allUser});
   }catch(err){
      return res.status(500).json({
         msg:err.message
      })
   }
}


export const receiveMessage = async(req,res)=>{
    try{
         const { reqId } = req.params;
         const userId  = req.user.id;
         let allMessages = await Message.find({$or:[ {senderId:userId} ,{ receiverId:userId} ]});
         
         allMessages = allMessages.filter(msg => {
            return ( msg.senderId == reqId || msg.receiverId == reqId); 
         });
        
         return res.status(200).json({
            msg:"messages fetched",
            allMessages
         });
         
    }catch(err){
      return res.status(500).json({
          message:"error ar receiving message endpoint",
          err
      })
    }
}
export const sendMessage =async(req,res)=>{
    try{
       const { message , receiverId } = req.body;
       if( ! message || ! receiverId ){
         return res.status(400).json({msg:"message is empty"});
       }
       const userId =  req.user.id;
       const newMessage = new  Message({
               senderId:userId,
               receiverId,
               message
       });
       await newMessage.save();

       return res.status(401).json({msg:"message sent successfully"});

    }catch(err){
      return res.status(500).json({msg:"error at sendMessage api endpoint",
         error:err
      });
    }
}
export const register = async(req,res)=>{
     try{
         const { username , password , email } = req.body;
         if( !username || !password || !email || password.length < 8) {
            return res.status(400).json({msg:"please provide all credentials and password with greater than or 8 characters"});
         }
         const check = await User.findOne({$or:[{username:username},{email:email}]});
         if(check){
            return res.status(400).json({
                 msg:"email or username is matched please give some unique"
            });
         }
         const newPassword = await bcrypt.hash(password,10);
         const newUser = new User({
            username:username ,
            email:email,
            password:newPassword
         });
         await newUser.save();
         
         return res.status(200).json({
            msg:"user created.."
         });
     }catch(err){
        return res.json(err);
     }
}
export const profile = async(req,res)=>{
   try{
          return res.json({
            user:req.user,
            msg:"workingg profile "
          })
   }catch(err){
      return res.status(500).json({
         msg:"some error occured at profile endpoint"
      });
   }
}
export const login = async(req,res)=>{
   try{
      const { email , password } = req.body;
      if( !email || !password ){
          return res.status(400).json({msg:"please provide all credentials"});
      }
      const user = await User.findOne({email}); 
      if(!user){
         return res.status(400).json({msg:"no such email founded"});
      }

      const check2 =  await bcrypt.compare(password,user.password);
      if(!check2){
         return res.status(400).json({
            msg:"wrong password"
         });
      }
      const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
      return res.status(200).json({
          token:token
      });

   }catch(err){
      return res.status(500).json({
         msg:"some error occured at login endpoint"
      });
   }
}
export const home = async(req,res)=>{
   try{
      return  res.json({
         msg:"home is workingg"
        })
   }catch(err){
      return res.status(500).json({msg:"some error occured at home redicting point"});
   }
}