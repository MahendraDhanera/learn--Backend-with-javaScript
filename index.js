
import dotenv from 'dotenv'

import connectDB from "./src/db/index1.js";
import app from './src/app.js';

dotenv.config()



connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("its running....")

    })
})
.catch((err)=>{
    console.log(" mongodb connection faild:",err);
})