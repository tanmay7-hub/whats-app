import { createSlice } from "@reduxjs/toolkit";
import {
  login,
  getUser,
  getChat,
  sendMessage,
  getCurrUser,
} from "../action/auth.action.js";
const initialState = {
  loggedInUser:{
    profilePic:"https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    userId:undefined,
  },
  isTokenThere: false,
  token: undefined,
  isLoading: false,
  isError: false,
  message: undefined,
  allUser: [],
  UserId: undefined,
  isLoggedIn: true,
  userClicked: false,
  clickedUser: {
    currUserLastSeen: null,
    currUserId: undefined,
    currUserProfilePic:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    currUserName: undefined,
    currUserIsOnline: false,
  },
  currChat: [],
};
const counterSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => initialState,
    setChatNull: (state) => {
      state.currChat = [];
    },
    addMessage: (state, action) => {
      state.currChat.push(action.payload);
    },
    updateDeliveryStatus: (state, action) => {
      state.currChat.forEach((msg) => {
        if (msg._id === action.payload.messageId) {
          msg.delivered = true;
        }
      });
    },
    deleteMessage:(state , action)=>{
       state.currChat.forEach((msg)=>{
          if(msg._id == action.payload.msgId){
             msg.deletedforEveryone = true;
          }
       });
    },
    updateReaction:(state,action)=>{
          const {messageId , reactions} = action.payload;

          const msg = state.currChat.find(m => m._id === messageId);
          
          if(msg){
            msg.reactions = reactions;
          }


    },
    UnreadIncrement:(state,action)=>{
           const {senderId} = action.payload;

           state.allUser = state.allUser.map((user)=>{
              return   user._id == senderId ? {...user , unreadCount : user.unreadCount + 1,lastMessage:action.payload.message}:user;
           })
    },
    updateMessageSeenStatus: (state, action) => {
      const { senderId, receiverId } = action.payload;

      state.currChat.forEach((msg) => {
        if (msg.senderId === senderId && msg.receiverId === receiverId) {
             msg.seen = true;
        }
      });
    },
    setCurrUser: (state, action) => {
      state.clickedUser = {
        ...state.clickedUser,
        currUserLastSeen: action.payload.currUserLastSeen,
        currUserIsOnline: action.payload.currUserIsOnline,
        currUserName: action.payload.currUserName,
        currUserProfilePic: action.payload.currUserProfilePic,
        currUserId: action.payload.currUserId,
      };
      state.userClicked = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isTokenThere = true;
        state.isLoggedIn = true;
        state.loggedInUser.profilePic = action.payload.profileImage;
        state.loggedInUser.userId = action.payload.userId;
        state.UserId = action.payload.userId;
       
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isTokenThere = false;
        state.message = action.payload.data.msg;
      })
      .addCase(getUser.pending, (state, action) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.allUser = action.payload.data;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = action.payload.data.msg;
      })

      .addCase(getChat.pending, (state, action) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        console.log("reducer");
        state.currChat = action.payload.allMessages;
      })
      .addCase(getChat.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = action.payload.data.message;
      })
      .addCase(sendMessage.pending, (state, action) => {
        //   state.isLoading = true; make a variable like is sending message
        state.isError = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isError = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload.data.msg;
      })
      .addCase(getCurrUser.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getCurrUser.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.UserId = action.payload.user.id;
      })
      .addCase(getCurrUser.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = true;
        state.message = action.payload.msg;
      });
  },
});

export const {
  reset,
  setCurrUser,
  setChatNull,
  addMessage,
  updateDeliveryStatus,
  updateMessageSeenStatus,
  UnreadIncrement,
  deleteMessage,
  updateReaction
} = counterSlice.actions;

export default counterSlice.reducer;
