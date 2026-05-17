import express from 'express'
import {protect} from '../middlewares/auth.js' 
import {register,home,login,profile,sendMessage , getChat , getAllUser} from "../controller/user.controller.js"
const router =  express.Router();

router.route("/message/send").post(protect,sendMessage);
router.route("/message").get(protect,getChat);// all message  between two person
router.route("/user/getAllUser").get(protect, getAllUser );
router.route("/register").post(register);
router.route("/home").get(home);
router.route("/login").post(login);
router.route("/profile").get(protect,profile);
export default router;