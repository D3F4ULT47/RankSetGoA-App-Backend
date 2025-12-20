import express from "express"
import cors from "cors"
import cookiParser from "cookie-parser"

const app = express()

app.use(
  cors({
    origin: "https://ranksetgo-app.netlify.app/", // Netlify frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended : true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookiParser())

//router import 
import  userRouter from "./routes/user.routes.js"
app.use("/api/v1/user",userRouter)

// Error handling middleware - must be after all routes
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export {app}