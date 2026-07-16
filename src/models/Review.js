import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
{
customerName:{
type:String,
required:true,
},

customerEmail:{
type:String,
required:true,
},

customerPhone:{
type:String,
required:true,
},

painter:{
type:mongoose.Schema.Types.ObjectId,
ref:"PainterProfile",
required:true,
},

request:{
type:mongoose.Schema.Types.ObjectId,
ref:"PainterRequest",
required:true,
unique:true,
},

rating:{
type:Number,
required:true,
min:1,
max:5,
},

review:{
type:String,
required:true,
trim:true,
},

isVisible:{
type:Boolean,
default:true,
},
},
{
timestamps:true,
}
);

export default mongoose.model(
"Review",
reviewSchema
);