import asyncHandler from '../utilites/asyncHandler.js'
import ApiError from '../utilites/ApiError.js'
import { User } from '../models/user.model.js'
import uploadinary from '../utilites/cloudinary.js'
import ApiResponse from '../utilites/ApiResponse.js'
import jwt from "jsonwebtoken"

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

//register--
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


//login user--

const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {email, username, password} = req.body
  // console.log(email);

  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await genrateAccessTokenAndrefreshTOken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})


//gentate new refresh token--
const refreshAccessTOken = asyncHandler(async(req,res)=>{

  const incommngRefreshTken = req.cookie.refreshToken || req.body.refreshToken
  
  if(incommngRefreshTken){
      throw new ApiError(400,"unauthorized request")
  }
  
  try {
      const decodedToken = jwt.verify(incommngRefreshTken,process.env.REFRESH_TOKEN_SECRET)
      const user = User.findById(decodedToken?._id)
      
      if(!user){
          throw new ApiError(401,"Invalid access token")
      }
      
      if(incommngRefreshTken !== user){
          throw new ApiError(401,"expir refresh token and used")
      }
      
      const option = {
          httpOnly:true,
          Secure:true
      }
      
      const {accessToken,newRefreshToken} = await genrateAccessTokenAndrefreshTOken(user._id)
      
      return res.status(200).cookie("accessToken",accessToken,option).cookie("newRefreshTOken",newRefreshToken,option).json(
          new ApiResponse(200,{accessToken,newRefreshToken},"refresh token genrate successfully",)
      )
  } catch (error) {
      throw new ApiError(400,error?.message || "invalid refresh token")
  }
  
  })
  

  


export  {
  register,
  loginUser,
  refreshAccessTOken
}