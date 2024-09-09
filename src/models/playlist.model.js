import mongoose,{model, Schema} from "mongoose";

const playlistSchema = Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

export const Playlist = mongoose.model("Playlist",playlistSchema)