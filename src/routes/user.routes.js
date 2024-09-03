import { Router } from "express";
import {register,loginUser} from "../controllers/user.controller.js";
import { upload } from "../middlware/multer.middlware.js"

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

export default router 