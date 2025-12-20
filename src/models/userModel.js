import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = mongoose.Schema({
username:{
   type:String,
  // required:true,
   unique:true,
   lowercase:true,
   trim:true,
   index:true
},
email:{
   type:String,//
   required:true,
   unique:true,
   lowercase:true,
   trim:true
},
fullName:{
  type:String,
  required:true, 
  trim:true,
  index:true
},
avatar:{
  type:String,// cloudinary url
},

password:{
  type:String,
  required:[true,"password is required"],
  trim:true,
  index:true
},

refreshToken:{ 
  type:String,
}
},
{timestamps:true}
)
// pre runs right before this model will be getting saved in the database 
userSchema.pre("save", async function() { 
  if (!this.isModified("password")) return ; 

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

userSchema.methods.isPasswordCorrect = async function (password) {
 return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = function(){
 const accessToken = jwt.sign(
    {
      _id:this._id,
      fullName:this.fullName
    }, 
      process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
    return accessToken
} 
userSchema.methods.generateRefreshToken = function(){
  
  const refreshToken = jwt.sign(
    {
      _id:this._id,
      fullName:this.fullName
    }, 
      process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
    return refreshToken
} 
export const userModel = mongoose.model("user",userSchema)