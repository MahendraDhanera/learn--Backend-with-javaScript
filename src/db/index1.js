
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

// const connectDB = async () => {
//  try {
// const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/youtube`)
// console.log("\n mongo db connected !!  db host ",connectionInstance.Connection.host);

//  }
//  catch (error) {
//     console.log("mongo db conection faild :",error)
//     process.exit(1)
//  }

// try {
//    const connetction_URL = "mongodb://mahendra:mahendra88895@cluster0-shard-00-00.cfn2w.mongodb.net:27017,cluster0-shard-00-01.cfn2w.mongodb.net:27017,cluster0-shard-00-02.cfn2w.mongodb.net:27017/youtube?ssl=true&replicaSet=atlas-2neakj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// //    mongoose.connect(connetction_URL).then((res)=>{
//          console.log(res,"res")
//    }).catch(()=>{

//    })

// } catch (error) {
//       console.log(error,"error");
// }





const connectDB = async () => {
   try {
 const connectionInstance = await mongoose.connect(`mongodb+srv://mahendra:mahendra88895@cluster0.cfn2w.mongodb.net/${DB_NAME}`)
      console.log("\n mongo db connected !!  db host :", connectionInstance.connection.host);

   }
   catch (error) {
      console.log("mongo db conection faild :", error)
      process.exit(1)
   }

}

export default connectDB


