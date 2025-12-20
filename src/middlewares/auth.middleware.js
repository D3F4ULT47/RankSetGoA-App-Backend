import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { userModel } from "../models/userModel.js"

export const verifyJWT= asyncHandler(async (req,res,next)=>{
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
    if(!token){
   throw new apiError(401,"Unauthorized request")
    }
    const decodedToken= jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    const userInfo = await userModel.findById(decodedToken?._id)
    .select("-password -refreshToken")
     if(!userInfo){
       throw new apiError (401, "Unauthorized access token")
     }
    req.user=userInfo
    next()
  } catch (error) {
    throw new apiError (401, error?.message || "Something Went Wrong (Tokens)")
  }
})
// someone  can easily hack these type of systems by having the token only
// this way they can surpass this also can have enormous amount of info that the req.use is going to proide it to them

