import asyncHandler from '../utilites/asyncHandler.js'
import ApiError from '../utilites/ApiError.js'
import { User } from '../models/user.model.js'
import uploadinary from '../utilites/cloudinary.js'
import ApiResponse from '../utilites/ApiResponse.js'
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

//genrate Access token and refresh token
const genrateAccessTokenAndrefreshTOken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.genrateAccessToken()
    const refreshToken = user.genrateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "some thing rong while genrating and accessig refresh token")
  }
}

//register--
const register = asyncHandler(async (req, res) => {
  //get user detais for frantend
  //validation-not empty
  //cheack if user alredy exitsL:username,email
  //chack for image,cheak for avtar
  //uplod them to cloudnary ,avtar
  //create user object
  //remove password and refresh token field from response
  //ckeck for user creaton
  //return respone


  const { fullname, email, password, username } = req.body

  if (fullname === "" && username === "") {
    throw new ApiError(400, "fullname and username must be required")
  }


  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fiels are compalsary required")
  }

  const existUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existUser) {
    throw new ApiError(409, "user with email and username is alredy exist")
  }
  // console.log(email,password,fullname,username);
  const pathAvtar = req.files?.avatar[0]?.path

  const pathCover = req.files?.coverImage[0].path


  if (!pathAvtar) {
    throw new ApiError(400, "Avatar files is requird")
  }

  const avatar = await uploadinary(pathAvtar)
  const coverImage = await uploadinary(pathCover)



  if (!avatar) {
    throw new ApiError(400, "Avatar fiels is requird")
  }

  const user = await User.create({
    fullname,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password: password,
    username: username.toLowerCase()
  })

  // console.log(password)

  const createdUser = await User.findById(user._id).select(
    "-refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Some ting rong while register the user")
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "user register successfully")
  )

})


//login user--
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body
  // console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await genrateAccessTokenAndrefreshTOken(user._id)

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
const refreshAccessTOken = asyncHandler(async (req, res) => {

  const incommngRefreshTken = req.cookie.refreshToken || req.body.refreshToken

  if (!incommngRefreshTken) {
    throw new ApiError(400, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incommngRefreshTken, process.env.REFRESH_TOKEN_SECRET)
    const user = User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid access token")
    }

    if (incommngRefreshTken !== user) {
      throw new ApiError(401, "expir refresh token and used")
    }

    const option = {
      httpOnly: true,
      Secure: true
    }

    const { accessToken, newRefreshToken } = await genrateAccessTokenAndrefreshTOken(user._id)

    return res.status(200).cookie("accessToken", accessToken, option).cookie("newRefreshTOken", newRefreshToken, option).json(
      new ApiResponse(200, { accessToken, newRefreshToken }, "refresh token genrate successfully",)
    )
  } catch (error) {
    throw new ApiError(400, error?.message || "invalid refresh token")
  }

})


//change currect password
const changeCurretPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordCurrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCurrect) {
    throw new ApiError(400, "invalid old password")
  }

  user.password = newPassword

  await user.save({ validateBeforeSave: false })

  return res.status(200).json(
    new ApiResponse(200, {}, "password change successfully")
  )
})


//get current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, req.user, "current user fetched successfuly")
  )
})


//Update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body

  if (!fullname || !email) {
    throw new ApiError(400, "all fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email
      },
    },
    { new: true }
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "Account update successfully")
  )
})


//Update User Avatar image
const updateUserAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiResponse(400, "avater file is missing")
  }

  const avatar = await uploadinary(avatarLocalPath)
  // console.log(avatar.url)

  if (!avatar.url) {
    throw new ApiError(400, "error while uloding on avatar")
  }


  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    }, { new: true }
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "update avater successfully")
  )


})


//update cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {

  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiResponse(400, "avater file is missing")
  }

  const coverImage = await uploadinary(coverImageLocalPath)
  // console.log(avatar.url)

  if (!coverImage.url) {
    throw new ApiError(400, "error while uloding on avatar")
  }


  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    }, { new: true }
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "update avater successfully")
  )


})

//get user profilel chanel
const getUserProfileChanel = asyncHandler(async (req, res) => {

  const { username } = req.params;
  console.log("username",username)

  if (!username.trim()) {
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTO"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers"
        },
        channelSubscriberCount: {
          $size: "$subscribedTO"
        },
        isSubscribed: {
          $cond: {
            if: { $gt: [req.user?._id, "subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscriberCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])
  console.log(channel)
  if (!channel?.length) {
    throw new ApiError(400, "channel does not exist")
  }

  return res.status(200).json(
    new ApiResponse(200, channel[0], "user channel successfully")
  )

})

//Get Watch History
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $arrayElemAt: [ "$owner", 0 ]
              }
            }
          }
        ]
      }
    }
  ])

  // console.log(user)
  return res.status(200).json(
    new ApiResponse(200, user[0].watchHistory, "watch history fatched successfully")
  )
})

export {
  register,
  loginUser,
  refreshAccessTOken,
  changeCurretPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserProfileChanel,
  getWatchHistory
}