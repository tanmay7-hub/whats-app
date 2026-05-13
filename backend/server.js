import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/user.routes.js'
import http from "http";
import { Server } from "socket.io"
import cors from "cors"


dotenv.config();
const app  = express();
const server = http.createServer(app);
const io =  new Server(server,{
    cors:{origin:"*"}
});

io.on("connection",(socket)=>{
   console.log(`socket connected :${socket.id}`);

   socket.on("dissconnect",()=>{
     console.log(`socket disconnected `);
   })
})

const PORT = process.env.PORT || 3000  ;
app.use(cors());
app.use(express.json());
app.use(userRoutes);

server.listen(PORT,async()=>{
      try{
          console.log(`listening on port ${PORT}`);
          await mongoose.connect(process.env.MONGO_URI);
          console.log('connected to mongodb');
      }
      catch(e){
          console.log(e);
      }   
});