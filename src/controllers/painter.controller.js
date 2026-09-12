// import mongoose from "mongoose";
// import User from "../models/User.js";
// import PainterProfile from "../models/PainterProfile.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import { uploadBuffer } from "../utils/cloudinaryUpload.js";
// import { sendPainterWelcomeEmail } from "../services/painterWelcomeEmail.service.js";
// import { sendPainterRegistrationNotification } from "../services/painterAdminNotification.service.js";

import mongoose from "mongoose";
import User from "../models/User.js";
import PainterProfile from "../models/PainterProfile.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadBuffer } from "../utils/cloudinaryUpload.js";
import parseArrayField from "../utils/parseArrayField.js";
import calculatePainterProfileCompletion
from "../utils/calculatePainterProfileCompletion.js";
import { deleteFile } from "../utils/cloudinaryUpload.js";
import { sendPainterPendingEmail } from "../services/painterPendingEmail.service.js";
import { sendPainterRejectedEmail } from "../services/painterRejectedEmail.service.js";
import { sendPainterApprovedEmail } from "../services/painterApprovedEmail.service.js";
// import PainterProfile from "../models/PainterProfile.js";
// import { uploadBuffer, deleteFile } from "../utils/cloudinaryUpload.js";
/*
|--------------------------------------------------------------------------
| REGISTER PAINTER
|--------------------------------------------------------------------------
*/

export const registerPainter =
asyncHandler(async (req, res) => {

    const session =
    await mongoose.startSession();

    session.startTransaction();

    try{

        /*
        |--------------------------------------------------------------------------
        | GET BODY
        |--------------------------------------------------------------------------
        */

        const{

            firstName,

            lastName,

            email,

            phoneNumber,

            password,

            bio,

            yearsOfExperience,

            state,

            city,

            skills,

            services,

            preferredBrands,

        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | GET FILES
        |--------------------------------------------------------------------------
        */

        const profileImage =
        req.files?.profileImage?.[0];

        const portfolioImages =
        req.files?.portfolioImages || [];

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if(

            !firstName ||

            !lastName ||

            !email ||

            !phoneNumber ||

            !password ||

            !bio ||

            !state ||

            !city

        ){

            await session.abortTransaction();

            session.endSession();

            return res.status(400).json({

                success:false,

                message:"Please fill all required fields."

            });

        }

        if(!profileImage){

            await session.abortTransaction();

            session.endSession();

            return res.status(400).json({

                success:false,

                message:"Profile image is required."

            });

        }

        if(portfolioImages.length===0){

            await session.abortTransaction();

            session.endSession();

            return res.status(400).json({

                success:false,

                message:"Upload at least one portfolio image."

            });

        }

        /*
        |--------------------------------------------------------------------------
        | CHECK USER
        |--------------------------------------------------------------------------
        */

        const existingUser =
        await User.findOne({

            email

        });

        if(existingUser){

            await session.abortTransaction();

            session.endSession();

            return res.status(409).json({

                success:false,

                message:"Email already exists."

            });

        }

        /*
        |--------------------------------------------------------------------------
        | UPLOAD PROFILE IMAGE
        |--------------------------------------------------------------------------
        */

        const uploadedProfileImage =
        await uploadBuffer(

            profileImage,

            "paintmarket/painters/profile"

        );

        /*
        |--------------------------------------------------------------------------
        | UPLOAD PORTFOLIO IMAGES
        |--------------------------------------------------------------------------
        */

        const uploadedPortfolioImages = [];

        for(const image of portfolioImages){

            const result =
            await uploadBuffer(

                image,

                "paintmarket/painters/portfolio"

            );

            uploadedPortfolioImages.push({

                url:result.secure_url,

                publicId:result.public_id,

            });

        }

        /*
        |--------------------------------------------------------------------------
        | CREATE USER
        |--------------------------------------------------------------------------
        */

        const createdUsers = await User.create(
        [
            {
                firstName,
                lastName,
                email,
                phoneNumber,
                password,
                role:"painter",
                isApproved:false,
            },
        ],
        {
            session,
        });

        const user =
        createdUsers[0];

        /*
        |--------------------------------------------------------------------------
        | CALCULATE PROFILE COMPLETION
        |--------------------------------------------------------------------------
        */

        const profileCompletion =
        calculatePainterProfileCompletion({

            bio,

            profileImage:
            uploadedProfileImage,

            portfolioImages:
            uploadedPortfolioImages,

            skills:
            parseArrayField(skills),

            services:
            parseArrayField(services),

            preferredBrands:
            parseArrayField(preferredBrands),

        });

        /*
        |--------------------------------------------------------------------------
        | CREATE PAINTER PROFILE
        |--------------------------------------------------------------------------
        */

        const createdPainterProfiles =
        await PainterProfile.create(
        [
            {

                user:user._id,

                bio,

                yearsOfExperience,

                state,

                city,

                skills:
                parseArrayField(skills),

                services:
                parseArrayField(services),

                preferredBrands:
                parseArrayField(preferredBrands),

                profileImage:{

                    url:
                    uploadedProfileImage.secure_url,

                    publicId:
                    uploadedProfileImage.public_id,

                },

                portfolioImages:
                uploadedPortfolioImages,

                verificationVideo:{

                    url:"",

                    publicId:"",

                },

                approvalStatus:"pending",

                profileCompletion,

            },
        ],
        {
            session,
        });

        const painter =
        createdPainterProfiles[0];

        /*
        |--------------------------------------------------------------------------
        | COMMIT TRANSACTION
        |--------------------------------------------------------------------------
        */

        await session.commitTransaction();

        session.endSession();

        /*
        |--------------------------------------------------------------------------
        | SEND EMAIL IN BACKGROUND
        |--------------------------------------------------------------------------
        */

        sendPainterPendingEmail({

            email:user.email,

            firstName:user.firstName,

        })
        .then(() => {

            console.log(

                `Pending painter email sent to ${user.email}`

            );

        })
        .catch((error) => {

            console.error(

                "Painter pending email failed:",

                error.message

            );

        });

        /*
        |--------------------------------------------------------------------------
        | RETURN RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(201).json({

            success:true,

            message:
            "Painter registration submitted successfully. Your application is awaiting approval.",

            painter,

        });

    }

    catch(error){

        await session.abortTransaction();

        session.endSession();

        throw error;

    }

});

/*
|--------------------------------------------------------------------------
| GET PENDING PAINTERS
|--------------------------------------------------------------------------
*/

export const getPendingPainters =
asyncHandler(async(req,res)=>{

    const painters =
    await PainterProfile.find({

        approvalStatus:"pending"

    })

    .populate({

        path:"user",

        select:"firstName lastName email phoneNumber"

    })

    .populate({

        path:"skills",

        select:"name type",

    })

    .populate({

        path:"services",

        select:"name type",

    })

    .populate({

        path:"preferredBrands",

        select:"name type",

    })

    .sort({

        applicationDate:-1

    });

    return res.status(200).json({

        success:true,

        count:painters.length,

        painters

    });

});


/*
|--------------------------------------------------------------------------
| GET APPROVED PAINTERS
|--------------------------------------------------------------------------
*/

export const getApprovedPainters =
asyncHandler(async (req, res) => {

    const painters =
await PainterProfile.find({

    approvalStatus: "approved",

    status: "active",

})
.populate({

    path: "user",

    select: "firstName lastName email phoneNumber",

})
.populate({

    path: "skills",

    select: "name type",

})
.populate({

    path: "services",

    select: "name type",

})
.populate({

    path: "preferredBrands",

    select: "name type",

})
.sort({

    approvedAt: -1,

});

    return res.status(200).json({

        success: true,

        count: painters.length,

        painters,

    });

});
/*
|--------------------------------------------------------------------------
| GET SINGLE PAINTER
|--------------------------------------------------------------------------
*/

export const getPainterById =
asyncHandler(async(req,res)=>{

    const painter =
    await PainterProfile.findById(

        req.params.id

    )

    .populate({

        path:"user",

        select:"firstName lastName email phoneNumber"

    })

    .populate({

        path:"skills",

        select:"name type",

    })

    .populate({

        path:"services",

        select:"name type",

    })

    .populate({

        path:"preferredBrands",

        select:"name type",

    });

    if(!painter){

        return res.status(404).json({

            success:false,

            message:"Painter not found."

        });

    }

    return res.status(200).json({

        success:true,

        painter

    });

});

/*
|--------------------------------------------------------------------------
| APPROVE PAINTER
|--------------------------------------------------------------------------
*/

export const approvePainter = asyncHandler(async (req, res) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        /*
        |--------------------------------------------------------------------------
        | FIND PAINTER
        |--------------------------------------------------------------------------
        */

        const painter = await PainterProfile.findById(
            req.params.id
        ).session(session);

        if (!painter) {

            await session.abortTransaction();

            session.endSession();

            return res.status(404).json({

                success: false,

                message: "Painter not found.",

            });

        }

        /*
        |--------------------------------------------------------------------------
        | CHECK IF ALREADY APPROVED
        |--------------------------------------------------------------------------
        */

        if (painter.approvalStatus === "approved") {

            await session.abortTransaction();

            session.endSession();

            return res.status(400).json({

                success: false,

                message: "Painter has already been approved.",

            });

        }

        /*
        |--------------------------------------------------------------------------
        | DELETE VERIFICATION VIDEO (OPTIONAL)
        |--------------------------------------------------------------------------
        */

        const { deleteVerificationVideo } = req.body;

        if (

            deleteVerificationVideo === true &&

            painter.verificationVideo?.publicId

        ) {

            await deleteFile(

                painter.verificationVideo.publicId,

                "video"

            );

            painter.verificationVideo = {

                url: "",

                publicId: "",

            };

        }

        /*
        |--------------------------------------------------------------------------
        | APPROVE PAINTER
        |--------------------------------------------------------------------------
        */

        painter.approvalStatus = "approved";

        painter.isVerified = true;

        painter.approvedAt = new Date();

        painter.approvedBy = req.user._id;

        painter.rejectionReason = "";

        await painter.save({

            session,

        });

        /*
        |--------------------------------------------------------------------------
        | UPDATE USER
        |--------------------------------------------------------------------------
        */

        const approvedUser = await User.findByIdAndUpdate(

            painter.user,

            {

                isApproved: true,

            },

            {

                new: true,

                session,

            }

        );

        /*
        |--------------------------------------------------------------------------
        | COMMIT TRANSACTION
        |--------------------------------------------------------------------------
        */

        await session.commitTransaction();

        session.endSession();

        /*
        |--------------------------------------------------------------------------
        | SEND APPROVAL EMAIL (BACKGROUND)
        |--------------------------------------------------------------------------
        */

        sendPainterApprovedEmail({

            email: approvedUser.email,

            firstName: approvedUser.firstName,

        })
        .then(() => {

            console.log(

                `✅ Approval email sent to ${approvedUser.email}`

            );

        })
        .catch((error) => {

            console.error(

                "❌ Painter approval email failed:",

                error

            );

        });

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            message: "Painter approved successfully.",

            painter,

        });

    }

    catch (error) {

        if (session.inTransaction()) {

            await session.abortTransaction();

        }

        session.endSession();

        throw error;

    }

});

/*
|--------------------------------------------------------------------------
| REJECT PAINTER
|--------------------------------------------------------------------------
*/

export const rejectPainter = asyncHandler(async (req, res) => {

    const { reason } = req.body;

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        /*
        |--------------------------------------------------------------------------
        | FIND PAINTER
        |--------------------------------------------------------------------------
        */

        const painter = await PainterProfile.findById(
            req.params.id
        ).session(session);

        if (!painter) {

            await session.abortTransaction();

            session.endSession();

            return res.status(404).json({

                success: false,

                message: "Painter not found.",

            });

        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE PAINTER
        |--------------------------------------------------------------------------
        */

        painter.approvalStatus = "rejected";

        painter.rejectionReason =
            reason || "Application rejected.";

        painter.isVerified = false;

        painter.approvedAt = null;

        painter.approvedBy = null;

        await painter.save({

            session,

        });

        /*
        |--------------------------------------------------------------------------
        | UPDATE USER
        |--------------------------------------------------------------------------
        */

        const rejectedUser = await User.findByIdAndUpdate(

            painter.user,

            {

                isApproved: false,

            },

            {

                new: true,

                session,

            }

        );

        /*
        |--------------------------------------------------------------------------
        | COMMIT TRANSACTION
        |--------------------------------------------------------------------------
        */

        await session.commitTransaction();

        session.endSession();

        /*
        |--------------------------------------------------------------------------
        | SEND REJECTION EMAIL (BACKGROUND)
        |--------------------------------------------------------------------------
        */

        sendPainterRejectedEmail({

            email: rejectedUser.email,

            firstName: rejectedUser.firstName,

            reason: painter.rejectionReason,

        })
        .then(() => {

            console.log(

                `✅ Rejection email sent to ${rejectedUser.email}`

            );

        })
        .catch((error) => {

            console.error(

                "❌ Painter rejection email failed:",

                error

            );

        });

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            message: "Painter application rejected successfully.",

            painter,

        });

    }

    catch (error) {

        if (session.inTransaction()) {

            await session.abortTransaction();

        }

        session.endSession();

        throw error;

    }

});

/*
|--------------------------------------------------------------------------
| UPLOAD VERIFICATION VIDEO
|--------------------------------------------------------------------------
*/

export const uploadVerificationVideo =
asyncHandler(async (req, res) => {

    const session =
    await mongoose.startSession();

    session.startTransaction();

    try {

        /*
        |--------------------------------------------------------------------------
        | GET PAINTER
        |--------------------------------------------------------------------------
        */

        const painter =
        await PainterProfile.findOne({

            user: req.user._id,

        }).session(session);

        if (!painter) {

            await session.abortTransaction();

            session.endSession();

            return res.status(404).json({

                success: false,

                message: "Painter profile not found.",

            });

        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATE FILE
        |--------------------------------------------------------------------------
        */

        const verificationVideo =
        req.files?.verificationVideo?.[0];

        if (!verificationVideo) {

            await session.abortTransaction();

            session.endSession();

            return res.status(400).json({

                success: false,

                message: "Please upload a verification video.",

            });

        }

        /*
        |--------------------------------------------------------------------------
        | DELETE OLD VIDEO IF EXISTS
        |--------------------------------------------------------------------------
        */

        if (

            painter.verificationVideo?.publicId

        ) {

            await deleteFile(

                painter.verificationVideo.publicId,

                "video"

            );

        }

        /*
        |--------------------------------------------------------------------------
        | UPLOAD NEW VIDEO
        |--------------------------------------------------------------------------
        */

        const uploadedVideo =
        await uploadBuffer(

            verificationVideo,

            "paintmarket/painters/verification",

            "video"

        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE PAINTER
        |--------------------------------------------------------------------------
        */

        painter.verificationVideo = {

            url: uploadedVideo.secure_url,

            publicId: uploadedVideo.public_id,

        };

        /*
        |--------------------------------------------------------------------------
        | RECALCULATE PROFILE COMPLETION
        |--------------------------------------------------------------------------
        */

        painter.profileCompletion =
        calculatePainterProfileCompletion({

            bio: painter.bio,

            profileImage: painter.profileImage,

            portfolioImages: painter.portfolioImages,

            verificationVideo:
            painter.verificationVideo,

            skills: painter.skills,

            services: painter.services,

            preferredBrands:
            painter.preferredBrands,

        });

        await painter.save({

            session,

        });

        await session.commitTransaction();

        session.endSession();

        /*
        |--------------------------------------------------------------------------
        | RETURN RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            message:
            "Verification video uploaded successfully. Your application is now ready for review.",

            verificationVideo:
            painter.verificationVideo,

            profileCompletion:
            painter.profileCompletion,

        });

    }

    catch (error) {

        await session.abortTransaction();

        session.endSession();

        throw error;

    }

});


/*
|--------------------------------------------------------------------------
| GET PAINTER STATUS
|--------------------------------------------------------------------------
*/

export const getPainterStatus =
asyncHandler(async (req, res) => {

    const painter =
    await PainterProfile.findOne({

        user: req.user._id,

    });

    if (!painter) {

        return res.status(404).json({

            success: false,

            message: "Painter profile not found.",

        });

    }

    /*
    |--------------------------------------------------------------------------
    | SCREEN FLOW
    |--------------------------------------------------------------------------
    */

    let screen = "";

    let message = "";

    /*
    |--------------------------------------------------------------------------
    | REJECTED
    |--------------------------------------------------------------------------
    */

    if (

        painter.approvalStatus === "rejected"

    ) {

        screen = "rejected";

        message =
        painter.rejectionReason ||
        "Your application was rejected.";

    }

    /*
    |--------------------------------------------------------------------------
    | APPROVED
    |--------------------------------------------------------------------------
    */

    else if (

        painter.approvalStatus === "approved"

    ) {

        screen = "dashboard";

        message =
        "Your account has been approved.";

    }

    /*
    |--------------------------------------------------------------------------
    | PENDING
    |--------------------------------------------------------------------------
    */

    else {

        if (

            !painter.verificationVideo?.url

        ) {

            screen =
            "upload_verification";

            message =
            "Please upload your verification video to complete your application.";

        }

        else {

            screen =
            "waiting_review";

            message =
            "Your verification video has been submitted successfully. Our team is reviewing your application.";

        }

    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({

        success: true,

        approvalStatus:
        painter.approvalStatus,

        screen,

        message,

        profileCompletion:
        painter.profileCompletion,

        verificationVideoUploaded:
        !!painter.verificationVideo?.url,

        rejectionReason:
        painter.rejectionReason,

        isVerified:
        painter.isVerified,

    });

});

/*
|--------------------------------------------------------------------------
| GET PAINTER DASHBOARD
|--------------------------------------------------------------------------
*/

export const getPainterDashboard =
asyncHandler(async (req, res) => {

    /*
    |--------------------------------------------------------------------------
    | GET PAINTER PROFILE
    |--------------------------------------------------------------------------
    */

    const painter =
    await PainterProfile.findOne({

        user: req.user._id,

    })
    .populate(
        "user",
        "firstName lastName email phoneNumber profileImage"
    )
    .populate({
        path: "skills",
        select: "name type",
    })
    .populate({
        path: "services",
        select: "name type",
    })
    .populate({
        path: "preferredBrands",
        select: "name type",
    });

    if (!painter) {

        return res.status(404).json({

            success: false,

            message:
            "Painter profile not found.",

        });

    }

    /*
    |--------------------------------------------------------------------------
    | ONLY APPROVED PAINTERS
    |--------------------------------------------------------------------------
    */

    if (
        painter.approvalStatus !== "approved"
    ) {

        return res.status(403).json({

            success: false,

            message:
            "Your account is yet to be approved.",

        });

    }

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({

        success: true,

        painter: {

            /*
            |--------------------------------------------------------------------------
            | BASIC IDENTIFICATION
            |--------------------------------------------------------------------------
            */

            id: painter._id,

            firstName:
            painter.user.firstName,

            lastName:
            painter.user.lastName,

            email:
            painter.user.email,

            phoneNumber:
            painter.user.phoneNumber,

            /*
            |--------------------------------------------------------------------------
            | PROFILE
            |--------------------------------------------------------------------------
            */

            bio:
            painter.bio,

            profileImage:
            painter.profileImage,

            state:
            painter.state,

            city:
            painter.city,

            yearsOfExperience:
            painter.yearsOfExperience,

            /*
            |--------------------------------------------------------------------------
            | SKILLS / SERVICES / BRANDS
            |--------------------------------------------------------------------------
            */

            skills:
            painter.skills || [],

            services:
            painter.services || [],

            preferredBrands:
            painter.preferredBrands || [],

            /*
            |--------------------------------------------------------------------------
            | PORTFOLIO & VERIFICATION MEDIA
            |--------------------------------------------------------------------------
            */

            portfolioImages:
            painter.portfolioImages || [],

            verificationVideo:
            painter.verificationVideo,

            /*
            |--------------------------------------------------------------------------
            | PAINTER STATUS
            |--------------------------------------------------------------------------
            */

            availabilityStatus:
            painter.availabilityStatus,

            approvalStatus:
            painter.approvalStatus,

            status:
            painter.status,

            isVerified:
            painter.isVerified,

            isFeatured:
            painter.isFeatured,

            featuredOrder:
            painter.featuredOrder,

            /*
            |--------------------------------------------------------------------------
            | PAINTER STATISTICS
            |--------------------------------------------------------------------------
            */

            averageRating:
            painter.averageRating,

            totalReviews:
            painter.totalReviews,

            completedJobs:
            painter.completedJobs,

            profileViews:
            painter.profileViews,

            /*
            |--------------------------------------------------------------------------
            | PROFILE COMPLETION
            |--------------------------------------------------------------------------
            */

            profileCompletion:
            painter.profileCompletion,

            /*
            |--------------------------------------------------------------------------
            | APPLICATION INFORMATION
            |--------------------------------------------------------------------------
            */

            applicationDate:
            painter.applicationDate,

            approvedAt:
            painter.approvedAt,

            rejectionReason:
            painter.rejectionReason,

            /*
            |--------------------------------------------------------------------------
            | TIMESTAMPS
            |--------------------------------------------------------------------------
            */

            createdAt:
            painter.createdAt,

            updatedAt:
            painter.updatedAt,

        },

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD STATISTICS
        |--------------------------------------------------------------------------
        */

        statistics: {

            pendingQuoteRequests: 0,

            pendingInspectionRequests: 0,

            unreadReviews: 0,

        }

    });

});
/*
|--------------------------------------------------------------------------
| GET PUBLIC PAINTERS
|--------------------------------------------------------------------------
*/

import Review from "../models/Review.js";

export const getPublicPainters =
asyncHandler(async (req, res) => {

    const painters =
await PainterProfile.find({

    approvalStatus: "approved",

    status: "active",

})

.populate({

    path: "user",

    select: "firstName lastName",

})

.populate({

    path: "skills",

    select: "name type",

})

.populate({

    path: "services",

    select: "name type",

})

.populate({

    path: "preferredBrands",

    select: "name type",

})

.sort({

    createdAt: -1,

});

    const formattedPainters =
    await Promise.all(

        painters.map(async (painter) => {

            const reviews =
            await Review.find({

                painter: painter._id,

                isVisible: true,

            });

            const totalReviews =
            reviews.length;

            const averageRating =
            totalReviews === 0

            ? 0

            :

            reviews.reduce(

                (sum, item) => sum + item.rating,

                0

            ) / totalReviews;

            return {

                _id: painter._id,

                fullName:
                `${painter.user.firstName} ${painter.user.lastName}`,

                profileImage:
                painter.profileImage?.url || "",

                bio:
                painter.bio,

                yearsOfExperience:
                painter.yearsOfExperience,

                state:
                painter.state,

                city:
                painter.city,

                skills:
                painter.skills,

                services:
                painter.services,

                preferredBrands:
                painter.preferredBrands,

                averageRating:
                Number(
                    averageRating.toFixed(1)
                ),

                totalReviews,

            };

        })

    );

    return res.status(200).json({

        success: true,

        count: formattedPainters.length,

        painters: formattedPainters,

    });

});



export const getPublicPainterById =
asyncHandler(async (req, res) => {

    const painter =
    await PainterProfile.findOne({

        _id: req.params.id,

        approvalStatus: "approved",

        status: "active",

    })

    .populate({

    path: "user",

    select: "firstName lastName",

})

.populate({

    path: "skills",

    select: "name type",

})

.populate({

    path: "services",

    select: "name type",

})

.populate({

    path: "preferredBrands",

    select: "name type",

});
    if (!painter) {

        return res.status(404).json({

            success: false,

            message: "Painter not found.",

        });

    }

    const reviews =
    await Review.find({

        painter: painter._id,

        isVisible: true,

    })

    .sort({

        createdAt: -1,

    });

    const totalReviews =
    reviews.length;

    const averageRating =
    totalReviews === 0

    ? 0

    :

    reviews.reduce(

        (sum, item) => sum + item.rating,

        0

    ) / totalReviews;

    return res.status(200).json({

        success: true,

        painter: {

            _id: painter._id,

            fullName:
            `${painter.user.firstName} ${painter.user.lastName}`,

            profileImage:
            painter.profileImage?.url || "",

            bio:
            painter.bio,

            yearsOfExperience:
            painter.yearsOfExperience,

            state:
            painter.state,

            city:
            painter.city,

            skills:
            painter.skills,

            services:
            painter.services,

            preferredBrands:
            painter.preferredBrands,

            portfolioImages:
            painter.portfolioImages,

            averageRating:
            Number(
                averageRating.toFixed(1)
            ),

            totalReviews,

            reviews,

        },

    });

});


// export const getAllPainters =
// asyncHandler(async (req, res) => {

//     const painters =
//     await Painter.find()
//     .sort({ createdAt: -1 });

//     res.status(200).json({

//         success: true,

//         count: painters.length,

//         painters,

//     });

// });

export const togglePainterStatus =
asyncHandler(async (req, res) => {

    const painter =
    await PainterProfile.findById(req.params.id);

    if (!painter) {

        return res.status(404).json({

            success: false,

            message: "Painter not found.",

        });

    }

    painter.status =
    painter.status === "active"
        ? "inactive"
        : "active";

    await painter.save();

    res.status(200).json({

        success: true,

        message: `Painter ${painter.status}.`,

        painter,

    });

});


export const updatePainterProfile = asyncHandler(async (req, res) => {
  const painter = await PainterProfile.findOne({
    user: req.user._id,
  });

  if (!painter) {
    return res.status(404).json({
      success: false,
      message: "Painter profile not found.",
    });
  }

  const {
    bio,
    yearsOfExperience,
    state,
    city,
    skills,
    services,
    preferredBrands,
    removePortfolioImages,
  } = req.body;

  /*
  |--------------------------------------------------------------------------
  | BASIC PROFILE INFORMATION
  |--------------------------------------------------------------------------
  */

  if (bio !== undefined) {
    painter.bio = bio;
  }

  if (yearsOfExperience !== undefined) {
    const experience = Number(yearsOfExperience);

    if (Number.isNaN(experience) || experience < 0) {
      return res.status(400).json({
        success: false,
        message: "Years of experience must be a valid number greater than or equal to 0.",
      });
    }

    painter.yearsOfExperience = experience;
  }

  if (state !== undefined) {
    painter.state = state;
  }

  if (city !== undefined) {
    painter.city = city;
  }

  /*
  |--------------------------------------------------------------------------
  | MASTER DATA
  |--------------------------------------------------------------------------
  | These fields contain MasterData ObjectIds.
  */

  if (skills !== undefined) {
    painter.skills = parseArrayField(skills);
  }

  if (services !== undefined) {
    painter.services = parseArrayField(services);
  }

  if (preferredBrands !== undefined) {
    painter.preferredBrands = parseArrayField(preferredBrands);
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE IMAGE
  |--------------------------------------------------------------------------
  */

  const newProfileImage = req.files?.profileImage?.[0];

  if (newProfileImage) {
    // Delete old Cloudinary image if one exists
    if (painter.profileImage?.publicId) {
      try {
        await deleteFile(painter.profileImage.publicId);
      } catch (error) {
        console.error(
          "Failed to delete old painter profile image:",
          error.message
        );
      }
    }

    const uploadedProfile = await uploadBuffer(
  newProfileImage,
  "paintmarket/painters/profile"
);

    painter.profileImage = {
      url: uploadedProfile.secure_url || uploadedProfile.url,
      publicId: uploadedProfile.public_id,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE PORTFOLIO IMAGES
  |--------------------------------------------------------------------------
  */

  if (removePortfolioImages !== undefined) {
    const imagesToRemove = parseArrayField(removePortfolioImages);

    if (imagesToRemove.length > 0) {
      const imagesToKeep = [];

      for (const image of painter.portfolioImages || []) {
        if (imagesToRemove.includes(image.publicId)) {
          if (image.publicId) {
            try {
              await deleteFile(image.publicId);
            } catch (error) {
              console.error(
                "Failed to delete painter portfolio image:",
                error.message
              );
            }
          }
        } else {
          imagesToKeep.push(image);
        }
      }

      painter.portfolioImages = imagesToKeep;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ADD NEW PORTFOLIO IMAGES
  |--------------------------------------------------------------------------
  */

  const newPortfolioImages = req.files?.portfolioImages || [];

  if (newPortfolioImages.length > 0) {
    const uploadedPortfolioImages = [];

    for (const file of newPortfolioImages) {
      const uploaded = await uploadBuffer(
        file,
        "paintmarket/painters/portfolio"
      );

      uploadedPortfolioImages.push({
        url: uploaded.secure_url || uploaded.url,
        publicId: uploaded.public_id,
      });
    }

    painter.portfolioImages.push(...uploadedPortfolioImages);
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE COMPLETION
  |--------------------------------------------------------------------------
  */

  painter.profileCompletion =
    calculatePainterProfileCompletion(painter);

  await painter.save();

  /*
  |--------------------------------------------------------------------------
  | RETURN UPDATED PROFILE
  |--------------------------------------------------------------------------
  */

  const updatedPainter = await PainterProfile.findById(painter._id)
    .populate({
      path: "user",
      select: "firstName lastName email phone profileImage",
    })
    .populate({
      path: "skills",
      select: "name type",
    })
    .populate({
      path: "services",
      select: "name type",
    })
    .populate({
      path: "preferredBrands",
      select: "name type",
    });

  return res.status(200).json({
    success: true,
    message: "Painter profile updated successfully.",
    painter: updatedPainter,
  });
});