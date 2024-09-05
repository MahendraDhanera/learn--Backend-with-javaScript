import { Router } from "express";
import {loginUser, register,refreshAccessTOken} from "../controllers/user.controller.js";
import { upload } from "../middlware/multer.middlware.js"
import { verifyJWT } from "../middlware/auth.js";
import logoutUser from "../controllers/logout.user.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    register
)

router.route("/login").post(loginUser)

//secure Route

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessTOken)


export default router 



