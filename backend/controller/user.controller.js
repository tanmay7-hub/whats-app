import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
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
      allUser.map(async (user) => {
        const unreadCount = await Message.countDocuments({
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
export const myGroups = async (req, res) => {
  try {
    const memberId = req.user.id;
    if (!memberId) {
      return res.status(400).json({ msg: "please provide member id" });
    }
    const groups = await Group.find({ members: { $in: [memberId] } }).populate(
      "members",
      "username profilePic ",
    );

    const groupWithUnreadCount = await Promise.all(
      groups.map(async (group) => {
        const unreadCount = await Message.countDocuments({
          groupId: group._id,
          seenBy: { $ne: memberId },
          senderId: { $ne: memberId },
        });
        return { ...group.toObject(), unreadCount };
      }),
    );
    return res.status(200).json({ groups });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "internal server error", err });
  }
};
export const photoUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "image not provided" });
    }

    const result = await new Promise(async (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "chat-app" },
        (err, rs) => {
          if (err) {
            reject(err);
          } else {
            resolve(rs);
          }
        },
      );

      stream.end(req.file.buffer);
    });
    return res
      .status(201)
      .json({ msg: "uploaded successfully", imageUrl: result.secure_url });
  } catch (err) {
    return res.status(500).json({ msg: "upload endpoint error", err });
  }
};
export const audioUpload = async (req, res) => {
  try {
    const result = await new Promise(async (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "voice-notes", resource_type: "video" },
        (err, rs) => {
          if (err) reject(err);
          else resolve(rs);
        },
      );
      stream.end(req.file.buffer);
    });

    return res
      .status(200)
      .json({
        msg: "audio uploaded successfully",
        audioUrl: result.secure_url,
      });
  } catch (err) {
    return res.status(500).json({ msg: "error at audio upload endpoint", err });
  }
};
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId)
      return res.status(404).json({ msg: "please provide  valid group id" });

    const messages = await Message.find({ groupId: groupId })
      .populate("senderId", "profilePic username")
      .sort({
        createdAt: 1,
      });
    return res.status(200).json({ msg: "group nessage fetched", messages });
  } catch (err) {
    return res.status(500).json({ msg: "internal server error", err: err });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { groupId, members } = req.body;

    const group = await Group.findById(groupId);

    if (!group)
      return res.status(404).json({
        msg: "Group not found",
      });

    const existing = new Set(group.members.map((m) => m.toString()));

    members.forEach((id) => {
      if (!existing.has(id)) {
        group.members.push(id);
      }
    });

    await group.save();

    await group.populate("members", "username profilePic");

    return res.status(200).json({
      msg: "Members added successfully",
      group,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};
export const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;

    const group = await Group.findById(groupId);

    if (!group)
      return res.status(404).json({
        msg: "Group not found",
      });

    group.members = group.members.filter((m) => m.toString() !== memberId);

    await group.save();

    await group.populate("members", "username profilePic");

    return res.status(200).json({
      msg: "Member removed successfully",
      group,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};
// export const makeAdmin = async(req , res) => {
// };
export const updateGroup = async (req, res) => {
  try {
    const { groupId, name, groupImage } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    if (name) group.name = name;
    if (groupImage) group.groupImage = groupImage;

    await group.save();

    await group.populate("members", "username profilePic");

    return res.status(200).json({
      msg: "Group updated successfully",
      group,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const memberId = req.user.id;

    if (!groupId || !memberId)
      return res.status(400).json({ msg: "please provide all details" });

    const group = await Group.findById(groupId);

    if (!group) return res.status(400).json({ msg: "group not found" });

    group.members = group.members.filter((m) => {
      return m.toString() !== memberId;
    });

    await group.save();
    return res.status(200).json({
    msg: "Left group successfully",
    groupId,
});
  } catch (err) {
    return res.status(500).json({ msg: "internal sever error" });
  }
};
export const createGroup = async (req, res) => {
  try {
    const { name, members, groupImage } = req.body;

    if (!name || !members)
      return res.status(400).json({ msg: "please provide full details" });

    const new_group = new Group({
      name: name,
      admin: req.user.id,
      groupImage,
      members: [...members, req.user.id],
    });

    await new_group.save();
    return res.status(200).json({ msg: "group created", group: new_group });
  } catch (err) {
    return res.status(500).json({ msg: "internal error", err });
  }
};
export const getCurrUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

   
    return res.status(200).json({
      userId: user._id,
      name : user.username,
      profileImage: user.profilePic,
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
      return res.status(400).json({
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
      name : user.username,
      profileImage: user.profilePic,
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
