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
  myGroups,
  getGroupMessages,
  leaveGroup,
  addMembers,
  updateGroup,
  removeMember
} from "../controller/user.controller.js";
import upload from "../config/multer.js";
const router = express.Router();

router.route("/message/send").post(protect, sendMessage);
router.route("/message").get(protect, getChat); // all message  between two person
router.route("/user/getAllUser").get(protect, getAllUser);
router.route("/upload-image").post(upload.single("image"), photoUpload);
router.route("/upload-audio").post(upload.single("audio"), audioUpload);
router.route("/register").post(register);
router.route("/home").get(home); 
router.route("/login").post(login);
router.route("/profile").get(protect, profile); 
router.route("/getCurrUser").get(protect, getCurrUser);


router.route("/group/createGroup").post(protect, createGroup);
router.route("/group/update").patch(protect, updateGroup);
router.route("/group/add-members").patch(protect, addMembers);
router.route("/group/remove-member").patch(protect, removeMember);
router.route("/group/leave-group").post(protect, leaveGroup);
router.route("/group/my-groups").get(protect, myGroups);
router.route("/group/chat/:groupId").get(protect, getGroupMessages);
export default router;
