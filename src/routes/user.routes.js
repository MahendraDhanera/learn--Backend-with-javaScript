import { Router } from "express";
import register from "../controllers/user.controller.js";
import { upload } from "../middlware/multer.middlware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"covreImage",
            maxCount:1
        }
    ]),
    register
)

export default router 