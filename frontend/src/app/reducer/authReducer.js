import { createSlice } from '@reduxjs/toolkit'
import { login ,getUser ,getChat } from "../action/auth.action.js"
const initialState={
    isTokenThere:false,
    token : undefined,
    isLoading:false,
    isError:false,
    message:undefined,
    allUser:[],
    clickedUser:{
          currUserId:undefined,
          currUserProfilePic:"https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
          currUserName:undefined,
          currUserIsOnline:false,
    },
    currChat:[]
}
const counterSlice = createSlice({
      name:'auth',
      initialState,
      reducers:{
        reset:(state)=>initialState,
        setCurrUser:(state,action)=>{
           
           
            state.clickedUser={
                 ...state.clickedUser,
                  currUserIsOnline : action.payload.currUserIsOnline,
                  currUserName : action.payload.currUserName,
                  currUserProfilePic :action.payload.currUserProfilePic,
                  currUserId : action.payload.currUserId                        
            }
           
     }
      },
      extraReducers:( builder =>{
        builder
        .addCase(login.pending,(state,action)=>{
             state.isLoading = true;
        })
        .addCase(login.fulfilled,(state,action)=>{
             state.isLoading    = false;
             state.isTokenThere = true;

        })
        .addCase(login.rejected,(state,action)=>{
             state.isLoading=false;
             state.isError= true;
             state.isTokenThere=false
            //  state.message = action.payload.msg
        })
        .addCase(getUser.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(getUser.fulfilled,(state,action)=>{
           state.isLoading = false;
           state.isError = false;  
           state.allUser = action.payload.data;
            
        })
        .addCase(getUser.rejected , (state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.message = action.payload.data.msg;
        })

        .addCase(getChat.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(getChat.fulfilled,(state,action)=>{
             state.isLoading = false;
             state.isError = false;  
             state.currChat = action.payload.data;
        })
        .addCase(getChat.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.message = action.payload.data.msg;
        })
        
      }

     )
});

export const {reset, setCurrUser}  = counterSlice.actions;

export default  counterSlice.reducer;