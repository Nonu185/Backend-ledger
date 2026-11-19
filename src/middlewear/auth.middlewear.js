const jwt = require("jsonwebtoken")
const usermodel = require("../models/user.model")

const authMiddlewear = async(req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if(!token){
        return res.status(401).json({success:false,message:"Unauthorized"})
    }
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        const user = await usermodel.findById(decode.id)
        req.user = user;
        return next();
    } catch (error) {
        return res.status(500).json({success:false,message:error.message});
    }
}

const authSystemMiddlewear = async(req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if(!token){
        return res.status(401).json({success:false,message:"Unauthorized"})
    }
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        const user = await usermodel.findById(decode.id)
        if(!user.systemUser){
            return res.status(403).json({success:false,message:"Forbidden"})
        }
        req.user = user;
        return next();
    } catch (error) {
        return res.status(500).json({success:false,message:error.message});
    }
}

module.exports={authMiddlewear,authSystemMiddlewear}


