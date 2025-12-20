import {Router} from "express"
import {
  changeCurrentPassword,
  getCurrentUser,
  logOutUser,
  refreshAccessToken,
  registerUser, 
  signInUser, 
  updateAccountDetail, 
  updateAvatar} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router()

// Public routes
router.route("/register").post(registerUser)
router.route("/login").post(signInUser)
router.route("/refresh-token").post(refreshAccessToken)

// Secured routes - require authentication
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").post(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetail)
router.route("/avatar").patch(verifyJWT,upload.single('avatar'),updateAvatar)

export default router