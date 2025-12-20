import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

const connectDB = async() => { 
  try{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\n MongoDB connected !! DB HOST :${process.env.PORT}`)
  }

  catch(error){
    console.log("MONGODB connection error :",error)
  }
}
export default connectDB