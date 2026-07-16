import Review from "../models/Review.js";
import PainterProfile from "../models/PainterProfile.js";

const updatePainterRating = async(painterId)=>{

const reviews=

await Review.find({

painter:painterId,

isVisible:true,

});

const totalReviews=

reviews.length;

const averageRating=

totalReviews===0

?0

:

reviews.reduce(

(sum,item)=>sum+item.rating,

0

)/totalReviews;

await PainterProfile.findByIdAndUpdate(

painterId,

{

averageRating:Number(

averageRating.toFixed(1)

),

totalReviews,

}

);

};

export default updatePainterRating;