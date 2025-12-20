import {asyncHandler} from "../utils/asyncHandler.js";
import {userModel} from "../models/userModel.js" 
import {upload} from"../middlewares/multer.middleware.js"
import {apiError} from "../utils/apiError.js"
import {uploadOperation} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(Id)=>{
  try {
    const user = await userModel.findById(Id)
    const accessToken =user.generateAccessToken()
    const refreshToken =user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken,refreshToken}
    
  } catch (error) {
   throw new apiError (error.status,"Error while generating the tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  if ([email, fullName, password].some(field => !field || field.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }

  const existingUser = await userModel.findOne({
    $or: [{ email }, { fullName }],
  });

  if (existingUser) {
    throw new apiError(400, "there exists an user with the provided credentials");
  }
  

  const newUser = await userModel.create({
    email,
    fullName,
    password,
  });

  const createdUser = await userModel
    .findById(newUser._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new apiError(500, "User creation failed");
  }
  const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(createdUser._id)
  await userModel.findByIdAndUpdate(
    createdUser._id,
    {
    $set:{
      refreshToken
    }
    },
    {
      new:true
    }
  )
  const options ={ // After this it can't be changed from frontEnd only from server
    httpOnly :true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new apiResponse(
      200,
      createdUser,
      "User registered successfully"
    )
  )
  
});




const signInUser = asyncHandler(async(req,res)=>{
  const{email,password}=req.body
  if(!(email && password)){
    throw new apiError(400,"Email and password are required")
   }
  let existingUser= await userModel.findOne({email})
  if(!existingUser){
    throw new apiError(404,"User not found")
  }
  let validUser= await existingUser.isPasswordCorrect(password)
  if(!validUser){
    throw new apiError(401,"Invalid User Credentials")
  }   
  const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(existingUser._id)
  const loggedInUser= await userModel.findById(existingUser._id).
  select("-password -refreshToken")
  const options ={ // After this it can't be changed from frontEnd only from server
    httpOnly :true,
    secure:true
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new apiResponse(
      200,
      {
        user:loggedInUser,accessToken,
        refreshToken,
      },
      "User loggedIn Successfully"
    )
  )
})
 
const logOutUser = asyncHandler(async(req,res)=>{
 await userModel.findByIdAndUpdate(
   req.user._id,
    {
      $set :{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options ={ // After this it can't be changed from frontEnd only from server
    httpOnly :true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new apiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
 try {
  const incomingRefreshToken=req.cookies?.refreshToken || req.body.refreshToken  
   if(!incomingRefreshToken){
    throw new apiError(401,"Bad Request")
   }
   const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
   const requestingUser= await userModel.findById(decodedToken._id)
   if(!requestingUser){
     throw new apiError(401,"Bad Request")
   }
   if(requestingUser.refreshToken!==incomingRefreshToken){
     throw new apiError(401,"Refresh Token is used or Expired")
   }
  const {accessToken,refreshToken:newRefreshToken}= await generateAccessAndRefreshTokens(requestingUser._id)
   const options ={ 
     httpOnly :true,
     secure:true
   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
    new apiResponse(
     200,
     {
       accessToken,refreshToken:newRefreshToken
     },
     "Access token refreshed"
    )
   )
 } catch (error) {
  throw new apiError(401,error?.message||"Bad Request")
  
 }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const user = await userModel.findById(req.user._id)
  const {oldPassword,newPassword}=req.body
   if(!(oldPassword && newPassword)){
      throw new apiError(400,"All fields are required")
    }
  let Result = await user.isPasswordCorrect(oldPassword) 
   if(!Result){
     throw new apiError(400,"Invalid Password")
    }
    user.password=newPassword
    await user.save({ 
    // Because while updating/saving the pasword.
    // It is compulsory to hash it , for that we have 
    // -prehook f(x) in userModel file  but to trigger it
    // -we need to use(".save") functionality.
    // findAndUpdate wont trigger that hook.
      validateBeforeSave:false
    })
   return res
   .status(200)
   .json(
    new apiResponse(
      200,
      {},
      "password changed successfully"
    )
   )
  
})

const getCurrentUser = asyncHandler(async(req,res)=>{
 return res
 .status(200)
 .json(
  new apiResponse(
    200,
    {user:req.user},
    "current user fetched successfully"
  )
 )
})

const updateAccountDetail = asyncHandler(async(req,res)=>{
 const {fullName,email,username} =req.body
 if(!(fullName || email || username)){
  throw new apiError(400,"At least one field is required")
 }
 const updateFields = {}
 if(fullName) updateFields.fullName = fullName
 if(email) updateFields.email = email
 if(username) {
   // Check if username is already taken by another user
   const existingUser = await userModel.findOne({ 
     username: username.toLowerCase().trim(),
     _id: { $ne: req.user._id }
   })
   if(existingUser){
     throw new apiError(400,"Username already taken")
   }
   updateFields.username = username.toLowerCase().trim()
 }
 
 const user = await userModel.findByIdAndUpdate(
   req.user?._id,
   {
    $set:updateFields
   },
   {
    new:true
   }
  ).select("-password -refreshToken")
 return res
 .status(200)
 .json(
  new apiResponse (
    200,
    {user},
    "account details updated"
  )
 )
})

const updateAvatar = asyncHandler(async(req,res)=>{
  const avatarPath=req.file?.path // during setting up of multer do upload.single('avatar')
  if(!avatarPath){
    throw new apiError(400,"Avatar field is required")
  }
  const avatarUpload = await uploadOperation(avatarPath)
  if(!avatarUpload?.url ){
    throw new apiError(400,"avatar-url not found")
  }
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        avatar: avatarUpload.url
      }
    },
    {
      new:true
    }
  ).select(
      "-password -refreshToken"
    ) 
    return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {user},
        "Avatar uploaded successfully"
      )
    )
})


export {
registerUser,
signInUser,
logOutUser,
refreshAccessToken,
changeCurrentPassword,
getCurrentUser,
updateAccountDetail,
updateAvatar
}