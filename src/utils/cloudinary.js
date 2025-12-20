import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

const uploadOperation =async (localFilePath) => {

    // Upload an image
     try {
      if(!localFilePath) return null
       const response = await cloudinary.uploader
         .upload(localFilePath ,{
          resource_type:"auto"
          })
          console.log("file is uploaded on Cloudinary",response.url)
          fs.unlinkSync(localFilePath)
          return response
          
    }
    catch(error){
      console.log(error);
      fs.unlinkSync(localFilePath)
      return null
      //removes the locally saved temporary file 
      //as the upload operation got failed
     }
}
    export {uploadOperation}
      
    
    