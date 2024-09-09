import ApiError from "../utilites/ApiError.js";
import asyncHandler from "../utilites/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async (req,res,next)=>{

    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
    if(!token){
        throw new ApiError(401,"unauthorized request")
    }

   const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

 const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

 if(!user){
    throw new ApiError(401,"Invalid access token")
 }

 req.user = user
 next()

    
})