import PainterRequest from "../models/PainterRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
// import {  sendPainterResponseEmail,} from "../services/painterRequestEmail.service.js";
import { sendPainterRequestEmail } from "../services/painterRequestEmail.service.js";
import { sendPainterRequestReceivedEmail } from "../services/painterRequestReceivedEmail.service.js";
import { sendPainterAcceptedEmail } from "../services/painterAcceptedEmail.service.js";
import { sendPainterDeclinedEmail } from "../services/painterDeclinedEmail.service.js";
import PainterProfile from "../models/PainterProfile.js";

export const createPainterRequest = asyncHandler(async (req, res) => {
  const { selectedPainter, ...requestData } = req.body;

const request = await PainterRequest.create({
  ...requestData,
  user: req.user?._id || null,
  selectedPainter: selectedPainter || null,
});

const populatedRequest =
await PainterRequest.findById(request._id)
.populate({
    path:"selectedPainter",
    populate:{
        path:"user",
        select:"firstName lastName email phoneNumber"
    }
});

try{

    // Customer confirmation

    await sendPainterRequestReceivedEmail({

        customerName:
        populatedRequest.fullName,

        email:
        populatedRequest.email,

    });

    // Painter notification

    if(
        populatedRequest.selectedPainter?.user?.email
    ){

        await sendPainterRequestEmail({

            painterName:
            `${populatedRequest.selectedPainter.user.firstName}
            ${populatedRequest.selectedPainter.user.lastName}`,

            email:
            populatedRequest.selectedPainter.user.email,

            customerName:
            populatedRequest.fullName,

            customerPhone:
            populatedRequest.phoneNumber,

            customerEmail:
            populatedRequest.email,

            propertyLocation:
            populatedRequest.propertyLocation,

            projectType:
            populatedRequest.projectType,

            preferredStartDate:
            populatedRequest.preferredStartDate,

        });

    }

}catch(error){

    console.error(
        "Painter request email error:",
        error
    );

}

  res.status(201).json({
    success: true,
    message: "Painter request submitted successfully",
    request,
  });
});

export const getPainterRequests =
  asyncHandler(async (req, res) => {
    const requests =
      await PainterRequest.find()

.populate({

    path:"selectedPainter",

    populate:{

        path:"user",

        select:

        "firstName lastName email phoneNumber"

    }

})

.sort({

    createdAt:-1

});

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  });

export const getPainterRequest =
  asyncHandler(async (req, res) => {
    const request =
      await PainterRequest.findById(

    req.params.id

)

.populate({

    path:"selectedPainter",

    populate:{

        path:"user",

        select:

        "firstName lastName email phoneNumber"

    }

});

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  });

export const updatePainterStatus =
  asyncHandler(async (req, res) => {
    const request =
      await PainterRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }

    request.status =
      req.body.status;

    await request.save();

    res.status(200).json({
      success: true,
      message:
        "Status updated successfully",
      request,
    });
  });


export const respondToPainterRequest =
  asyncHandler(async (
    req,
    res
  ) => {

    const request =
      await PainterRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Painter request not found",
      });
    }

    const {
      estimatedCost,
      inspectionDate,
      adminResponse,
      status,
    } = req.body;

    request.estimatedCost =
      estimatedCost;

    request.inspectionDate =
      inspectionDate;

    request.adminResponse =
      adminResponse;

    request.status =
      status?.trim() ||
      "quoted";

    request.responseDate =
      new Date();

    await request.save();

    try {
      await sendPainterResponseEmail({
        customerName:
          request.fullName,

        email:
          request.email,

        estimatedCost,

        inspectionDate,

        adminResponse,
      });

      console.log(
        `Painter response email sent to ${request.email}`
      );
    } catch (error) {
      console.error(
        "Painter response email failed:",
        error.message
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Painter request updated successfully",
      request,
    });

  });

  /*
|--------------------------------------------------------------------------
| MY REQUESTS
|--------------------------------------------------------------------------
*/

export const getMyPainterRequests =
asyncHandler(async(req,res)=>{

    const painter =
    await PainterProfile.findOne({

        user:req.user._id

    });

    if(!painter){

        return res.status(404).json({

            success:false,

            message:"Painter profile not found."

        });

    }

    const requests =
    await PainterRequest.find({

        selectedPainter:painter._id

    })

    .sort({

        createdAt:-1

    });

    return res.status(200).json({

        success:true,

        count:requests.length,

        requests

    });

});

/*
|--------------------------------------------------------------------------
| ACCEPT PAINTER REQUEST
|--------------------------------------------------------------------------
*/

export const acceptPainterRequest =
asyncHandler(async(req,res)=>{

const painter=
await PainterProfile.findOne({

user:req.user._id

});

if(!painter){

return res.status(404).json({

success:false,

message:"Painter profile not found."

});

}

const request=
await PainterRequest.findById(

req.params.id

);

if(!request){

return res.status(404).json({

success:false,

message:"Request not found."

});

}

if(

request.selectedPainter?.toString()!==

painter._id.toString()

){

return res.status(403).json({

success:false,

message:"This request does not belong to you."

});

}

if(request.status!=="pending"){

return res.status(400).json({

success:false,

message:"This request has already been processed."

});

}

request.status="accepted";

await request.save();

/*
|--------------------------------------------------------------------------
| CUSTOMER EMAIL
|--------------------------------------------------------------------------
*/

try{

await sendPainterAcceptedEmail({

customerName:
request.fullName,

email:
request.email,

painterName:
`${req.user.firstName}
${req.user.lastName}`,

painterPhone:
req.user.phoneNumber,

painterEmail:
req.user.email,

});

}catch(error){

console.error(

"Accepted email error:",

error

);

}

return res.status(200).json({

success:true,

message:"Request accepted successfully.",

request,

});

});

/*
|--------------------------------------------------------------------------
| DECLINE PAINTER REQUEST
|--------------------------------------------------------------------------
*/

export const declinePainterRequest =
asyncHandler(async(req,res)=>{

const painter=
await PainterProfile.findOne({

user:req.user._id

});

if(!painter){

return res.status(404).json({

success:false,

message:"Painter profile not found."

});

}

const request=
await PainterRequest.findById(

req.params.id

);

if(!request){

return res.status(404).json({

success:false,

message:"Request not found."

});

}

if(

request.selectedPainter?.toString()!==

painter._id.toString()

){

return res.status(403).json({

success:false,

message:"This request does not belong to you."

});

}

if(request.status!=="pending"){

return res.status(400).json({

success:false,

message:"This request has already been processed."

});

}

const{

reason

}=req.body;

request.status="declined";

request.adminResponse=

reason||

"Painter declined this request.";

request.responseDate=

new Date();

await request.save();

/*
|--------------------------------------------------------------------------
| CUSTOMER EMAIL
|--------------------------------------------------------------------------
*/

try{

await sendPainterDeclinedEmail({

customerName:
request.fullName,

email:
request.email,

painterName:
`${req.user.firstName}
${req.user.lastName}`,

reason:
request.adminResponse,

});

}catch(error){

console.error(

"Declined email error:",

error

);

}

return res.status(200).json({

success:true,

message:"Request declined successfully.",

request,

});

});


/*
|--------------------------------------------------------------------------
| CUSTOMER - GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings = asyncHandler(async (req, res) => {
  const requests = await PainterRequest.find({
    user: req.user._id,
  })
    .populate({
      path: "selectedPainter",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .sort({
      createdAt: -1,
    });

  return res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});