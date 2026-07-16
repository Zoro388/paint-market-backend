import mongoose from "mongoose";

const painterRequestSchema =
  new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
      },

      phoneNumber: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      propertyLocation: {
        type: String,
        required: true,
      },

      projectType: {
        type: String,
        required: true,
      },

      propertyType: {
        type: String,
        required: true,
      },

      projectDescription: {
        type: String,
        required: true,
      },

      preferredStartDate: {
        type: Date,
      },

      additionalNotes: {
        type: String,
      },

      inspectionDate: {
        type: Date,
      },

      estimatedCost: {
        type: Number,
        default: 0,
      },

      adminResponse: {
        type: String,
        default: "",
      },

      responseDate: {
        type: Date,
      },
      /*
|--------------------------------------------------------------------------
| SELECTED PAINTER
|--------------------------------------------------------------------------
*/

selectedPainter: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "PainterProfile",
  default: null,
},

assignedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

      status:{
type:String,
enum:[
"pending",
"accepted",
"declined",
"inspection_booked",
"quotation_sent",
"work_in_progress",
"completed",
"cancelled",
],
default:"pending",
},
    },
    {
      timestamps: true,
    }
  );


export default mongoose.model(
  "PainterRequest",
  painterRequestSchema
);