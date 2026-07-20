import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
     groupImage:{
        type:String,
        default:""
     },
     admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
     },
     members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
     ]

},{timestamps:true});


const Group = new mongoose.model("Group",groupSchema);
export default Group;