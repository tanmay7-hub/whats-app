import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js"
export const setStatusOnline = async (data) => {
  try {
    await User.UpdateOne({ _id: data.userId }, { $set: { isOnline: true } });
    return "status updated successfully";
  } catch (err) {
    return err.data;
  }
};
export const getAllUser = async (req, res) => {
  try {
    const allUser = await User.find().select("-password");

    const userWithUnreadCount = await Promise.all(
      allUser.map(async(user) => {
        const unreadCount = await  Message.countDocuments({
          senderId: user._id,
          receiverId: req.user.id,
          seen: false,
        });
        return { ...user.toObject(), unreadCount };
      }),
    );

    return res.status(200).json({ data: userWithUnreadCount });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};
export const photoUpload = async(req,res)=>{
    try{     
         if(!req.file){
            return res.status(400).json({msg:"image not provided"});
         }

         const result = await  new Promise(async(resolve,reject)=>{

              const stream =  cloudinary.uploader.upload_stream(
                         {folder:"chat-app"},
                         (err,rs)=>{
                               if(err){
                                 reject(err);
                               }else{
                                 resolve(rs);
                               }
                          });

            stream.end(req.file.buffer);
         });
         return res.status(201).json({msg:"uploaded successfully",imageUrl:result.secure_url});
    }catch(err){
      return res.status(500).json({ msg:"upload endpoint error" ,err })
    }
};
export const audioUpload = async(req,res)=>{
  try{
     const result = await new Promise(async(resolve,reject)=>{
              
          const stream = cloudinary.uploader.upload_stream(
              {folder : "voice-notes",
                resource_type:"video"
              },
              (err,rs)=>{
                if(err)reject(err);
                else resolve(rs);
              }
          );
          stream.end(req.file.buffer);
     });
    
     return res.status(200).json({msg:"audio uploaded successfully" , audioUrl : result.secure_url});

  }catch(err){
    return res.status(500).json({msg:'error at audio upload endpoint',err});
  }
}
export const getCurrUser = async (req, res) => {
  try {
    return res.json({
      user: req.user,
      msg: "workingg profile ",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "some error while finding user", err: err });
  }
};
export const getChat = async (req, res) => {
  try {
    const { reqId } = req.query;
    const userId = req.user.id;
    // console.log(reqId);

    let allMessages = await Message.find({
      $or: [{ senderId: userId }, { senderId: reqId }],
    });

    allMessages = allMessages.filter((msg) => {
      return msg.receiverId == reqId || msg.receiverId == userId;
    });
    // console.log(allMessages);
    return res.status(200).json({
      msg: "messages fetched",
      allMessages,
    });
  } catch (err) {
    return res.status(500).json({
      message: "error ar receiving message endpoint",
      err,
    });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { message, receiverId } = req.body;
    if (!message || !receiverId) {
      return res.status(400).json({ msg: "message is empty" });
    }
    const userId = req.user.id;

    const newMessage = new Message({
      senderId: userId,
      receiverId,
      message,
    });
    //will later upgrade it to queue
    await User.updateOne({ _id: userId }, { $set: { lastMessage: message } });
    await User.updateOne(
      { _id: receiverId },
      { $set: { lastMessage: message } },
    );

    await newMessage.save();

    return res.status(401).json({ msg: "message sent successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "error at sendMessage api endpoint" });
  }
};
export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email || password.length < 8) {
      return res
        .status(400)
        .json({
          msg: "please provide all credentials and password with greater than or 8 characters",
        });
    }
    const check = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (check) {
      return res.status(400).json({
        msg: "email or username is matched please give some unique",
      });
    }
    const newPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      password: newPassword,
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      token: token,
      msg: "user created..",
    });
  } catch (err) {
    return res.json(err);
  }
};
export const profile = async (req, res) => {
  try {
    return res.json({
      user: req.user,
      msg: "workingg profile ",
    });
  } catch (err) {
    return res.status(500).json({
      msg: "some error occured at profile endpoint",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "please provide all credentials" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "no such email founded" });
    }

    const check2 = await bcrypt.compare(password, user.password);
    if (!check2) {
      return res.status(400).json({
        msg: "wrong password",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      token: token,
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "some error occured at login endpoint",
    });
  }
};
export const home = async (req, res) => {
  try {
    return res.json({
      msg: "home is workingg",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "some error occured at home redicting point" });
  }
};
