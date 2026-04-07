import mongoose from 'mongoose';
const messageSchema  = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    text:{
        type:String
    },
    image:{
        type:String
    },
    fileUrl:{
        type:String
    },
    fileType:{
        type:String,
        enum:['image','pdf',null],
        default:null
    },
    deliveredAt:{
        type:Date,
        default:null
    },
    readAt:{
        type:Date,
        default:null
    },
    reactions:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        emoji:{
            type:String,
            required:true,
            trim:true
        }
    }]
},{timestamps:true})

const Message = mongoose.model('Message',messageSchema);

export default Message;