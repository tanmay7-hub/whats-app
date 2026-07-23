import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  register,
  home,
  login,
  profile,
  sendMessage,
  getChat,
  getAllUser,
  getCurrUser,
  photoUpload,
  audioUpload,
  createGroup,
  myGroups
} from "../controller/user.controller.js";
import upload from "../config/multer.js";
const router = express.Router();

router.route("/message/send").post(protect, sendMessage);
router.route("/message").get(protect, getChat); // all message  between two person
router.route("/user/getAllUser").get(protect, getAllUser);
router.route("/upload-image").post(upload.single("image"), photoUpload);
router.route("/upload-audio").post(upload.single("audio"), audioUpload);
router.route("/group/create-group").post(protect ,createGroup);
router.route("/group/createGroup").get(myGroups);
router.route("/register").post(register);
router.route("/home").get(home); 
router.route("/login").post(login);
router.route("/profile").get(protect, profile); 
router.route("/getCurrUser").get(protect, getCurrUser);
export default router;
