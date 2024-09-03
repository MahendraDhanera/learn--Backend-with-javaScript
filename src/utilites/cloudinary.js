import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: 'diqwrqkl2',
    api_key: '998353313581172',
    api_secret: 'rK7OJw2y_gB2CD3ck16LBRhXZi0'
})

const uploadinary = async (localfilepath)=>{
    
   try {
    // if(!localfilepath) return n
    //upload file cloudnary
    console.log(localfilepath);
    const response = await cloudinary.uploader.upload(localfilepath)
    //file has been uploded successfully
    console.log(response);
    return response;

    
   } catch (error) {
    // fs.unlinkSync(localfilepath) //temprery remove file in locally
    console.log("file upload error",error)
    return null;
   }
}

export default uploadinary