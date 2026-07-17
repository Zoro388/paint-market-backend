import Review from "../models/Review.js";
import PainterRequest from "../models/PainterRequest.js";
import PainterProfile from "../models/PainterProfile.js";
import asyncHandler from "../utils/asyncHandler.js";
import updatePainterRating from "../utils/updatePainterRating.js";



/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
*/

export const createReview = asyncHandler(async (req, res) => {
  const { requestId, rating, review } = req.body;

  if (!requestId || !rating || !review) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  // Logged in customer must own this request
  const request = await PainterRequest.findOne({
    _id: requestId,
    user: req.user._id,
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  if (!request.selectedPainter) {
    return res.status(400).json({
      success: false,
      message: "No painter has been assigned to this booking.",
    });
  }

  // Optional but highly recommended:
  // Only allow reviews after the job has reached the review stage.
//   if (request.status !== "reviewing") {
//     return res.status(400).json({
//       success: false,
//       message: "This booking is not yet available for review.",
//     });
//   }

  const existingReview = await Review.findOne({
    request: request._id,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this booking.",
    });
  }

  const reviewDoc = await Review.create({
    customerName: request.fullName,
    customerEmail: request.email,
    customerPhone: request.phoneNumber,
    painter: request.selectedPainter,
    request: request._id,
    rating,
    review,
  });

  await updatePainterRating(request.selectedPainter);

  return res.status(201).json({
    success: true,
    message: "Review submitted successfully.",
    review: reviewDoc,
  });
});


/*
|--------------------------------------------------------------------------
| GET MY REVIEWS (PAINTER)
|--------------------------------------------------------------------------
*/

export const getMyReviews =
asyncHandler(async(req,res)=>{

const painter=

await PainterProfile.findOne({

user:req.user._id,

});

if(!painter){

return res.status(404).json({

success:false,

message:"Painter profile not found."

});

}

const reviews=

await Review.find({

painter:painter._id,

isVisible:true,

})

.sort({

createdAt:-1,

});

return res.status(200).json({

success:true,

averageRating:

painter.averageRating,

totalReviews:

painter.totalReviews,

reviews,

});

});


/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL REVIEWS
|--------------------------------------------------------------------------
*/

export const getAllReviews =
asyncHandler(async(req,res)=>{

const reviews=

await Review.find()

.populate({

path:"painter",

populate:{

path:"user",

select:"firstName lastName email",

},

})

.sort({

createdAt:-1,

});

return res.status(200).json({

success:true,

count:reviews.length,

reviews,

});

});


/*
|--------------------------------------------------------------------------
| ADMIN - TOGGLE REVIEW VISIBILITY
|--------------------------------------------------------------------------
*/

export const toggleReviewVisibility =
asyncHandler(async(req,res)=>{

const review=

await Review.findById(

req.params.id

);

if(!review){

return res.status(404).json({

success:false,

message:"Review not found."

});

}

review.isVisible=

!review.isVisible;

await review.save();

/*
|--------------------------------------------------------------------------
| UPDATE PAINTER RATING
|--------------------------------------------------------------------------
*/

await updatePainterRating(

review.painter

);

return res.status(200).json({

success:true,

message:"Review visibility updated.",

review,

});

});


/*
|--------------------------------------------------------------------------
| ADMIN - DELETE REVIEW
|--------------------------------------------------------------------------
*/

export const deleteReview =
asyncHandler(async(req,res)=>{

const review=

await Review.findById(

req.params.id

);

if(!review){

return res.status(404).json({

success:false,

message:"Review not found."

});

}

const painterId=

review.painter;

await review.deleteOne();

/*
|--------------------------------------------------------------------------
| UPDATE PAINTER RATING
|--------------------------------------------------------------------------
*/

await updatePainterRating(

painterId

);

return res.status(200).json({

success:true,

message:"Review deleted successfully.",

});

});
/*
|--------------------------------------------------------------------------
| GET REVIEWS FOR A PAINTER (PUBLIC)
|--------------------------------------------------------------------------
*/

export const getPainterReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    painter: req.params.id,
    isVisible: true,
  }).sort({
    createdAt: -1,
  });

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce(
          (sum, item) => sum + item.rating,
          0
        ) / totalReviews;

  return res.status(200).json({
    success: true,
    averageRating: Number(
      averageRating.toFixed(1)
    ),
    totalReviews,
    reviews,
  });
});