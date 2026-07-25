import { createAsyncThunk } from "@reduxjs/toolkit";
import clientServer from "../../config/axios.js";


export const login = createAsyncThunk(
  "auth/loginUser",
  async (data, thunkAPI) => {
    try {
      const res = await clientServer.post("/login", {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("token", res.data.token);
      return thunkAPI.fulfillWithValue(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }
  },
);
export const getCurrUser = createAsyncThunk(
  "auth/getCurrUser",
  async(data,thunkAPI)=>{
    try{
      const res = await clientServer.get("/getCurrUser" , {
           headers: {
              authorization: "bearer " + localStorage.getItem("token"),
           },
      });
    
         return thunkAPI.fulfillWithValue(res.data);
    }catch(err){
      return thunkAPI.rejectWithValue(err.response);
    }
  }
)
export const register = createAsyncThunk(
  "auth/registerUser",
  async (data, thunkAPI) => {
    try {
      const res = await clientServer.post("/register", {
        email: data.email,
        username: data.username,
        password: data.password,
      });

      localStorage.setItem("token", res.data.token);
      return thunkAPI.fulfillWithValue(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }
  },
);
export const getUser = createAsyncThunk(
  "auth/getUser",
  async (data, thunkAPI) => {
    try {
      const res = await clientServer.get("/user/getAllUser", {
        headers: {
          authorization: "bearer " + localStorage.getItem("token"),
        },
      });
      
      return thunkAPI.fulfillWithValue(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response);
    }  
  },
);
export const createGroup = createAsyncThunk(
 "auth/createGroup",
 async(data, thunkAPI)=>{
     try{
         const res = await clientServer.post("group/createGroup",data , {
             headers:{ authorization: "bearer " + localStorage.getItem("token"),}
         });
         console.log(res);
         return thunkAPI.fulfillWithValue(res.data);
     }catch(err){
      console.log(err);
         return thunkAPI.rejectWithValue(err.response);
     }
 }
);
export const getAllGroups = createAsyncThunk(
   "auth/getAllGroups",
  async(data , thunkAPI) =>{
     try{
       const res = await clientServer.get("group/my-groups" , {
         headers:{
             authorization: "bearer " + localStorage.getItem("token"),
         }
       });
       return thunkAPI.fulfillWithValue(res.data);
     }catch(err){
       return thunkAPI.rejectWithValue(err.response);
     }
  }
);
export const getGroupChat = createAsyncThunk(
    "auth/getGroupChat",
    async (groupId, thunkAPI) => {
        try {
            const res = await clientServer.get(
                `/group/chat/${groupId}`,
                {
                    headers: {
                        authorization:
                            "bearer " + localStorage.getItem("token"),
                    },
                }
            );

            return thunkAPI.fulfillWithValue(res.data);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response);
        }
    }
);
export const getChat = createAsyncThunk(
  "auth/getChat",
  async (data, thunkAPI) => {
    try {
      console.log(data);
      const res = await clientServer.get("/message", {
        params: {
          reqId: data.reqId,
        },
        headers: {
          authorization: "bearer " + localStorage.getItem("token"),
        },
      });
      return thunkAPI.fulfillWithValue(res.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  },
);
export const sendMessage = createAsyncThunk(
  "auth/sendMessage",
   async(data,thunkAPI)=>{
       try{
           const res = await clientServer.post("message/send",{
                message :data.message,
               receiverId:data.receiverId
           },{
            headers: {
                 authorization: "bearer " + localStorage.getItem("token"),
            },
           });

           return thunkAPI.fulfillWithValue(res);
       }catch(err){
        return thunkAPI.rejectWithValue(err);
       }
   }
);
