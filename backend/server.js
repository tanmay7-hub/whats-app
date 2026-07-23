import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setStatusOnline } from "./controller/user.controller.js";
import User from "./models/user.model.js";
import Message from "./models/message.model.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
const onlineUser = {};
const socketToUser = {};

io.on("connection", (socket) => {
  console.log(`socket connected :${socket.id}`);

  socket.on("user-logged-in", async (data) => {
    await User.updateOne({ _id: data.id }, { $set: { isOnline: true } });

    onlineUser[data.id] = socket.id;
    socketToUser[socket.id] = data.id;

    // for pending messages
    const messages = await Message.find({
      receiverId: socketToUser[socket.id],
      delivered: false,
    });

    await Message.updateMany(
      { $and: [{ receiverId: socketToUser[socket.id] }, { delivered: false }] },
      { $set: { delivered: true } },
    );
    // const s = new Set();
    for (let msg of messages) {
      const senderSocketId = onlineUser[msg.senderId];

      if (senderSocketId) {
        // s.add(senderSocketId);
        io.to(senderSocketId).emit("message-delivered", {
          messageId: msg._id,
        });
      }
    }

    io.emit("refresh-users");
  });
  socket.on("chat-opened", async (data) => {
    const senderId = data.senderId; 
    const receiverId = socketToUser[socket.id]; 
    await Message.updateMany(
      {
        senderId,
        receiverId,
      },
      { $set: { seen: true } },
    );

    const senderSocketId = onlineUser[senderId];
    if (senderSocketId) {
    
      socket.to(senderSocketId).emit("update-seen", {
        senderId,
        receiverId,
      });
    }
  });
  socket.on("emoji-reaction", async (data) => {
    const userId = socketToUser[socket.id];
    const msg = await Message.findById(data.messageId);
    
    const existingReaction = await msg.reactions.find(
      (r) => r.userId.toString() === userId,
    ); 

    if (!existingReaction) {
      msg.reactions.push({
        userId,
        emoji: data.emoji,
      });
    } else if (existingReaction.emoji === data.emoji) {
      msg.reactions = msg.reactions.filter(
        (r) => r.userId.toString() !== userId,
      );
    } else {
      existingReaction.emoji = data.emoji;
    }

    await msg.save();
    
    const user1 = onlineUser[msg.senderId];
    const user2  = onlineUser[msg.receiverId];
  
   if(user1) io.to(user1).emit("reaction-updated", {
      messageId:msg._id,
      reactions: msg.reactions,
    });
 
   if(user2) io.to(user2).emit("reaction-updated", {
      messageId:msg._id,
      reactions: msg.reactions,
    });
  });
  socket.on("delete-message", async (data) => {
    const { msgId } = data;
   
    const msg = await Message.findById(msgId);
    if (!msg || msg.deletedForEveryone) return;

    const userId = socketToUser[socket.id];
    if (msg.senderId.toString() !== userId) {
      return;
    }

    const receiverId = msg.receiverId;
    await Message.updateOne(
      { _id: msgId },
      { $set: { deletedforEveryone: true } },
    );
    const receiverSocketId = onlineUser[msg.receiverId];

    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("message-deleted", {
        msgId,
      });
    }
    socket.emit("message-deleted", {
      msgId,
    });
  });
  socket.on("msg-send", async (data) => {
    const newMessage = new Message({
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      imageUrl: data.image,
      audioUrl: data.audio,
      replyTo: data.replyTo,
    });
    await User.updateOne(
      { _id: data.senderId },
      { $set: { lastMessage: data.message } },
    );
    await User.updateOne(
      { _id: data.receiverId },
      { $set: { lastMessage: data.message } },
    );

    await newMessage.save();
    const receiverSocketId = onlineUser[data.receiverId];
    const senderSocketId = onlineUser[data.senderId];

    io.to(senderSocketId).emit("msg-sent", {
      ...newMessage.toObject(),
      delivered: receiverSocketId ? true : false,
    });

    if (receiverSocketId) {
    
      io.to(receiverSocketId).emit("receive-message", newMessage);
    }
  }); 
  socket.on("msg-delivered", async (data) => {
    await Message.updateOne(
      { _id: data.messageId },
      { $set: { delivered: true } },
    );

    const senderSocketId = onlineUser[data.senderId];

    if (senderSocketId) {
      socket
        .to(senderSocketId)
        .emit("message-delivered", { messageId: data.messageId });
    }
  });
  socket.on("user-typing", async (data) => {
    const receiverSocketId = onlineUser[data.receiverId];

    socket.to(receiverSocketId).emit("user-typing", data);
  });
  socket.on("stop-typing", async (data) => {
    const receiverSocketId = onlineUser[data.receiverId];

    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("stop-typing", data);
    }
  });
  socket.on("disconnect", async (data) => {
    console.log(`socket disconnected :${socket.id}`);
    const userId = socketToUser[socket.id];
    await User.updateOne(
      { _id: userId },
      { $set: { lastSeen: new Date(), isOnline: false } },
    );

    delete onlineUser[userId];
    delete socketToUser[socket.id];
    io.emit("refresh-users");
  });
});
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(userRoutes);

server.listen(PORT, async () => {
  try {
    console.log(`listening on port ${PORT}`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb");
  } catch (e) {
    console.log(e);
  }
});
