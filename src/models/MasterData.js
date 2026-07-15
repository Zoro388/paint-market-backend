import mongoose from "mongoose";

const masterDataSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        enum: [
          "skill",
          "service",
          "brand",
        ],
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

/*
|--------------------------------------------------------------------------
| Prevent duplicate values inside each type
|--------------------------------------------------------------------------
*/

masterDataSchema.index(
  {
    type: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "MasterData",
  masterDataSchema
);