import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
      senderId:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'user',
         required:true
      },
      receiverId:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'user',
         required:true
      },
      message:{
        type:{
         type:String,
         enum:["text","image","audio"],
         default:"text",
      },
        required:true
      },
      message:String,
      imageUrl:String,
      audioUrl:String,
      delivered:{
         type:Boolean,
         default:false
      },
      seen:{
         type:Boolean,
         default:false
      }
  
},{timestamps:true});


const Message = new mongoose.model("Message", messageSchema);
export default Message; 