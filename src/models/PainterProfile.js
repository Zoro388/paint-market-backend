import mongoose from "mongoose";

const painterProfileSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PERSONAL INFORMATION
    |--------------------------------------------------------------------------
    */

    bio: {
      type: String,
      required: true,
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PROFILE IMAGE
    |--------------------------------------------------------------------------
    */

    profileImage: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | SKILLS
    |--------------------------------------------------------------------------
    */

    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterData",
      },
    ],

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterData",
      },
    ],

    preferredBrands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterData",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | PORTFOLIO
    |--------------------------------------------------------------------------
    */

    portfolioImages: [
      {
        url: String,
        publicId: String,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | VERIFICATION VIDEO
    |--------------------------------------------------------------------------
    */

    verificationVideo: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | APPLICATION
    |--------------------------------------------------------------------------
    */

    approvalStatus: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    applicationDate: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | PERFORMANCE
    |--------------------------------------------------------------------------
    */

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },

    profileViews: {
      type: Number,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    availabilityStatus: {
      type: String,
      enum: [
        "available",
        "busy",
        "offline",
      ],
      default: "available",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    featuredOrder: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    averageRating:{
type:Number,
default:0,
},

totalReviews:{
type:Number,
default:0,
},

    /*
    |--------------------------------------------------------------------------
    | PROFILE COMPLETION
    |--------------------------------------------------------------------------
    */

    profileCompletion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "PainterProfile",
  painterProfileSchema
);