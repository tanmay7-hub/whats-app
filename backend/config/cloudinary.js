import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv"

dotenv.config();

cloudinary.config(); //will read the cloudinary url automatically from the env file
export default cloudinary;