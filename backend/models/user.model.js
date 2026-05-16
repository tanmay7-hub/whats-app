import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
      username:{
         type:String,
         required:true
      },
      email:{
         type:String,
         required:true
      },
      password:{
          type:String,
          required:true
      },
      lastMessage:{
         type:String,
         default:""
      },
      isOnline:{
         type:Boolean,
         default:false
      },
      profilePic:{
         type:String,
         default:"https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
      }
});
const  User = mongoose.model("User",userSchema );
export default User;