import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config('../');
export const protect = async(req,res,next)=>{
    try{
       const authHeader = req.headers.authorization;

       if(!authHeader){
        //  console.log(req.headers.authorisation);
         
         return res.status(400).json({msg:"no token provided"});
       }
       

       const token  = authHeader.split(" ")[1];
       //    console.log(token);
        
    
       const decode = jwt.verify(token,process.env.JWT_SECRET);
       req.user = decode;
       next(); 
    }catch(err){
        return res.status(500).json({
            msg:"error at auth middleware",
            err:err
        });
    }
}