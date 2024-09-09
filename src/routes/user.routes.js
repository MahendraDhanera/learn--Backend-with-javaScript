import { Router } from "express";
import {
    loginUser,
    register,
    refreshAccessTOken,
    changeCurretPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserProfileChanel,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlware/multer.middlware.js"
import { verifyJWT } from "../middlware/auth.js";
import logoutUser from "../controllers/logout.user.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    register
)

router.route("/login").post(loginUser)

//secure Route

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessTOken)
router.route("/change-password").post(verifyJWT, changeCurretPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserProfileChanel)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router



