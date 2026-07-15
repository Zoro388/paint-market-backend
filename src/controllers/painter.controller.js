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

        const verificationVideo =
        req.files?.verificationVideo?.[0];

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

        if(!verificationVideo){

            await session.abortTransaction();

            session.endSession();

            return res.status(400).json({

                success:false,

                message:"Verification video is required."

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
        | UPLOAD VERIFICATION VIDEO
        |--------------------------------------------------------------------------
        */

        const uploadedVerificationVideo =
        await uploadBuffer(

            verificationVideo,

            "paintmarket/painters/verification",

            "video"

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
      role: "painter",
      isApproved: false,
    },
  ],
  { session }
);

const user = createdUsers[0];
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

  verificationVideo:{

    url:
    uploadedVerificationVideo.secure_url,

  },

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
            [{
                user:user._id,

                bio,

                yearsOfExperience,

                state,

                city,

                skills: parseArrayField(skills),

                services: parseArrayField(services),

                preferredBrands: parseArrayField(preferredBrands),

                profileImage:{

                    url:
                    uploadedProfileImage.secure_url,

                    publicId:
                    uploadedProfileImage.public_id,

                },

                portfolioImages:
                uploadedPortfolioImages,

                verificationVideo:{

                    url:
                    uploadedVerificationVideo.secure_url,

                    publicId:
                    uploadedVerificationVideo.public_id,

                },

                approvalStatus:"pending",

                profileCompletion,

            }],
            {
                session,
            }
        );
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
  email: user.email,
  firstName: user.firstName,
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
asyncHandler(async(req,res)=>{

    const painters =
    await PainterProfile.find({

        approvalStatus:"approved"

    })

    .populate({

        path:"user",

        select:"firstName lastName email phoneNumber"

    })

    .sort({

        approvedAt:-1

    });

    return res.status(200).json({

        success:true,

        count:painters.length,

        painters

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

    .populate("skills")

    .populate("services")

    .populate("preferredBrands");

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