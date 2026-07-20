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
      replyTo:{
         _id:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'Message'
         },
         type:{
          type:String,
          enum:["text","image","audio"],
         },
         message:String,   
         senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
         }

      },
      deletedforEveryone:{
         type:Boolean,
         default:false
      },
      reactions:[
         {
            userId:{
               type:mongoose.Schema.Types.ObjectId,
               ref:'user'
            },
            emoji:String
         }
      ], 
      message:{
        type:{
         type:String,
         enum:["text","image","audio"],
         default:"text",
        },
        required:true
      },
       groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
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