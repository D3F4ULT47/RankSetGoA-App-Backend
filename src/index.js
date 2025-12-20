import mongoose from "mongoose"
import {DB_NAME} from './constants.js'
import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"



dotenv.config({
  path:"./.env"
})
connectDB()
  .then(()=>{
   app.listen(process.env.PORT || 8000,()=>{
    console.log("The App is listening on PORT :",process.env.PORT)
   })
  })
  .catch((err)=>{
  console.log("MongoDB connection failed",err)
  })