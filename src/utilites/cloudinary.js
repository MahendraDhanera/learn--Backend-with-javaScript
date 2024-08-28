import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    coud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadinary = async (localfilepath)=>{
   try {
    if(!localfilepath) return null
    //upload file cloudnary
    const response = await cloudinary.uploader.upload(localfilepath,{resource_type:"auto"})
    //file has been uploded successfully
    // console.log(response);
    return response;
    
   } catch (error) {
    fs.unlinkSync(localfilepath) //temprery remove file in locally
    return null;
   }
}

export default uploadinary