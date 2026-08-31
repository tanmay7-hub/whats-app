import { createSlice } from "@reduxjs/toolkit";
import {
  login,
  getUser,
  getChat,
  sendMessage,
  getCurrUser,
  getAllGroups,
  createGroup,
  getGroupChat,
  leaveGroup,
  updateGroup,
  addMembers,
  removeMember,
} from "../action/auth.action.js";
const initialState = {
  loggedInUser: {
    profilePic:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    userId: undefined,
  },
  isTokenThere: false,
  token: undefined,
  isLoading: false,
  isError: false,
  message: undefined,
  allUser: [],
  allGroups: [],

  UserId: undefined,
  isLoggedIn: true,
  userClicked: false,
  currentConversation: {
    type: null, // "user" | "group"
    id: null,
    name: "",
    profilePic: "",
    isOnline: false,
    lastSeen: null,
    members: [],
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
    deleteMessage: (state, action) => {
      state.currChat.forEach((msg) => {
        if (msg._id == action.payload.msgId) {
          msg.deletedforEveryone = true;
        }
      });
    },
    updateClickedStatus: (state, action) => {
      state.userClicked = !state.userClicked;
    },
    updateReaction: (state, action) => {
      const { messageId, reactions } = action.payload;

      const msg = state.currChat.find((m) => m._id === messageId);

      if (msg) {
        msg.reactions = reactions;
      }
    },
    UnreadIncrement: (state, action) => {
      const { senderId } = action.payload;

      state.allUser = state.allUser.map((user) => {
        return user._id == senderId
          ? {
              ...user,
              unreadCount: user.unreadCount + 1,
              lastMessage: action.payload.message,
            }
          : user;
      });
    },
    groupUnreadIncrement: (state, action) => {
      const { groupId, message } = action.payload;

      state.allGroups = state.allGroups.map((group) => {
        return group._id === groupId
          ? {
              ...group,
              unreadCount: group.unreadCount + 1,
              lastMessage: message,
            }
          : group;
      });
    },
    updateMessageSeenStatus: (state, action) => {
      const { senderId, receiverId } = action.payload;

      state.currChat.forEach((msg) => {
        if (msg.senderId === senderId && msg.receiverId === receiverId) {
          msg.seen = true;
        }
      });
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
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
      .addCase(getAllGroups.pending, (state, action) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.allGroups = action.payload.groups;
      })

      .addCase(getAllGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = action.payload.msg;
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
        state.isLoading = false;
        state.message = action.payload.msg;
      })
      .addCase(createGroup.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.allGroups = [...state.allGroups, action.payload.group];
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
      })
      .addCase(getGroupChat.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getGroupChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currChat = action.payload.messages;
      })

      .addCase(getGroupChat.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const updatedGroup = action.payload.group;

        state.allGroups = state.allGroups.map((group) =>
          group._id === updatedGroup._id ? updatedGroup : group,
        );

        if (state.currentConversation?.id === updatedGroup._id) {
          state.currentConversation = {
            ...state.currentConversation,
            ...updatedGroup,
            profilePic: updatedGroup.groupImage,
          };
        }
      })
      .addCase(addMembers.fulfilled, (state, action) => {
        const updatedGroup = action.payload.group;

        state.allGroups = state.allGroups.map((group) =>
          group._id === updatedGroup._id ? updatedGroup : group,
        );

        if (state.currentConversation?.id === updatedGroup._id) {
          state.currentConversation = {
            ...state.currentConversation,
            ...updatedGroup,
            profilePic: updatedGroup.groupImage,
          };
        }
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.allGroups = state.allGroups.filter(
          (group) => group._id !== action.payload.groupId,
        );

       
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        const updatedGroup = action.payload.group;

        state.allGroups = state.allGroups.map((group) =>
          group._id === updatedGroup._id ? updatedGroup : group,
        );

        if (state.currentConversation?.id === updatedGroup._id) {
          state.currentConversation = {
            ...state.currentConversation,
            ...updatedGroup,
            profilePic: updatedGroup.groupImage,
          };
        }
      });
    
  },
});

export const {
  reset,
  setChatNull,
  addMessage,
  updateDeliveryStatus,
  updateMessageSeenStatus,
  UnreadIncrement,
  groupUnreadIncrement,
  deleteMessage,
  updateReaction,
  setCurrentConversation,
  updateClickedStatus,
} = counterSlice.actions;

export default counterSlice.reducer;
