import asyncHandler from '../utilites/asyncHandler.js'
import ApiError from '../utilites/ApiError.js'
import { User } from '../models/user.model.js'
import uploadinary from '../utilites/cloudinary.js'
import ApiResponse from '../utilites/ApiResponse.js'

const genrateAccessTokenAndrefreshTOken = async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.genrateAccessToken()
    const refreshToken = user.genrateRefreshToken()

    user.refreshToken  = refreshToken
   await user.save({validateBeforeSave:false})
    
   return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"some thing rong while genrating and accessig refresh token")
  }
}


const register = asyncHandler(async (req,res)=>{
  //get user detais for frantend
  //validation-not empty
  //cheack if user alredy exitsL:username,email
  //chack for image,cheak for avtar
  //uplod them to cloudnary ,avtar
  //create user object
  //remove password and refresh token field from response
  //ckeck for user creaton
  //return respone


  const {fullname,email,password,username} = req.body

  if(fullname === "" && username === ""){
    throw new ApiError(400,"fullname and username must be required")
  }
 

  if(
    [fullname,email,password,username].some((field)=> field?.trim() === "")
  ) {
    throw new ApiError(400,"All fiels are compalsary required")
  }

const existUser = await User.findOne({
  $or : [{username},{email}]
})

if(existUser){
  throw new ApiError(409,"user with email and username is alredy exist")
}
// console.log(email,password,fullname,username);
const pathAvtar = req.files?.avatar[0]?.path

const pathCover = req.files?.coverImage[0].path


if(!pathAvtar){
  throw new ApiError(400,"Avatar files is requird")
}
           
const avatar = await uploadinary(pathAvtar)
const coverImage = await uploadinary(pathCover)



if(!avatar){
  throw new ApiError(400,"Avatar fiels is requird")
}

 const user = await User.create({
  fullname,
  email,
  avatar:avatar.url,
  coverImage:coverImage?.url || "",
  password:password,
  username:username.toLowerCase()
})

// console.log(password)

const createdUser = await User.findById(user._id).select(
  "-refreshToken"
)

if(!createdUser){
  throw new ApiError(500,"Some ting rong while register the user")
}

return res.status(201).json(
  new ApiResponse(201,createdUser,"user register successfully")
)

})

const loginUser = asyncHandler(async (req,res)=>{
//req body-data
//username or email
//find the user
//password check
//refreshToken and accessToken
//send coolie

const {username,email,password} = req.body

if(!username || !email){
  throw new ApiError(400,"username and email is requird")
}

const user = await User.findOne({
  $or:[{username},{email}]
})

if(!user){
  throw new ApiError(404,"user does not exist ")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
  throw new ApiError(404," some thing rong username and password is incorrect")
}

const {accessToken,refreshToken} = await genrateAccessTokenAndrefreshTOken(user._id)

const loginUser = User.findById(user._id).select("-password -refreshToken")

const option = {
  httpOnly:true,
  secure:true
}

res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(
  new ApiResponse(
    200,
    {
        loginUser,accessToken,refreshToken
    },
    "user login successfully login"
  )
)

})

export  {
  register,
  loginUser
}