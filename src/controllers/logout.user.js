import { User } from "../models/user.model.js";
import ApiResponse from "../utilites/ApiResponse.js";
import asyncHandler from "../utilites/asyncHandler.js";

const logoutUser = asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    }
)

const option = {
    httpOnlt:true,
    secure:true
}

return res.status(200).clearCookie("accessToken",option)
.clearCookie("refreshToken",option)
.json(new ApiResponse(200,{},"logout successfully"))
})

export default logoutUser