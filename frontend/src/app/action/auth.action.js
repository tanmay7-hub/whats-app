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
export const getChat = createAsyncThunk(
  "auth/getChat",
  async (data, thunkAPI) => {
    try {
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
