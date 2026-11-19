const usermodel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenblacklistmodel = require('../models/tokenblacklist.model');

/**
 *-/api/auth/register
 *-userregister controller to register user and generate token
 */
const userregister = async (req,res)=>{
 const {username,email,password}=req.body;

 const isuserexist = await usermodel.findOne({email});

 if(isuserexist){
    return res.status(422).json({
        message:"User already exists",
        status:"failed"
    })
 } 

 const user = await usermodel.create({username,email,password});

 const token = jwt.sign(
    {id:user._id},
    process.env.JWT_SECRET,
    {expiresIn:"3d"}
 );
 res.cookie('token',token);

    
 return res.status(201).json({
    message:"User created successfully",
    status:"success",
    user
 })
}

/**
 *-/api/auth/login
 *-userlogin controller to login user and generate token
 */
const userlogin = async(req,res)=>{
   const {email,password} = req.body;
   const user = await usermodel.findOne({email}).select("+password")
   if(!user){
    return res.status(404).json({
        message:"User not found",
        status:"failed"
    })
   }
   const ispasswordmatch = await user.matchPassword(password);
   if(!ispasswordmatch){
    return res.status(401).json({
        message:"Invalid credentials",
        status:"failed"
    })
   }

   const token = jwt.sign({
    id:user._id
   },process.env.JWT_SECRET,{expiresIn:"3d"})
   
   res.cookie('token',token )

    return res.status(200).json({
        message:"User logged in successfully",
        status:"success",
        user
    })
}

/**
 *-/api/auth/logout
 *-userlogout controller to logout user and blacklist the token
 */
const userlogout = async (req,res)=>{

    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    await tokenblacklistmodel.create({token:token});
   
        res.clearCookie('token');
        return res.status(200).json({message:"User logged out successfully"});
    
}

module.exports = {
    userregister,
    userlogin,
    userlogout
}

