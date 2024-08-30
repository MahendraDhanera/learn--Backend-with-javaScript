import asyncHandler from '../utilites/asyncHandler.js'

const register = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"ok"
    })
})

export default register