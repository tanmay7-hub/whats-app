import { createSlice } from '@reduxjs/toolkit'
import { login ,getUser } from "../action/auth.action.js"
const initialState={
    isTokenThere:false,
    token : undefined,
    isLoading:false,
    isError:false,
    message:undefined,
    allUser:[]

}
const counterSlice = createSlice({
      name:'auth',
      initialState,
      reducers:{
        reset:(state)=>initialState
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
             state.message = action.payload.msg
        })
        .addCase(getUser.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(getUser.fullfilled,(state,action)=>{
           state.isLoading = false;
           state.isError = false;
           state.allUser = action.payload.data
        })
        .addCase(getUser.rejected , (state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.message = action.payload.msg
        })

        
      }

     )
});

export const {reset}  = counterSlice.actions;

export default  counterSlice.reducer;