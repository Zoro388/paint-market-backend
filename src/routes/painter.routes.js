import express from "express";

import painterUpload from "../middleware/painterUpload.middleware.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import {

    registerPainter,

    getPendingPainters,

    getApprovedPainters,

    getPainterById,

    approvePainter,

    rejectPainter,

    uploadVerificationVideo,
    getPainterStatus,
getPainterDashboard,
getPublicPainters,
getPublicPainterById,
// getAllPainters,
togglePainterStatus,

}
from "../controllers/painter.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.post(

"/register",

painterUpload.fields([

{
name:"profileImage",
maxCount:1
},

{
name:"portfolioImages",
maxCount:6
},

{
name:"verificationVideo",
maxCount:1
}

]),

registerPainter

);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.get(

"/pending",

protect,

authorize("admin"),

getPendingPainters

);
/*
|--------------------------------------------------------------------------
| PAINTER DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  protect,
  authorize("painter"),
  getPainterDashboard
);

router.get(

"/approved",

protect,

authorize("admin"),

getApprovedPainters

);

// router.get(
//     "/all",
//     protect,
//     authorize("admin"),
//     getAllPainters
// );

router.patch(
    "/:id/status",
    protect,
    authorize("admin"),
    togglePainterStatus
);

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
"/",
getPublicPainters
);

router.get(
"/:id",
getPublicPainterById
);

router.get(
"/:id",
protect,
authorize("admin"),
getPainterById
);

router.patch(

"/:id/approve",

protect,

authorize("admin"),

approvePainter

);

router.patch(

"/:id/reject",

protect,

authorize("admin"),

rejectPainter

);


router.patch(
  "/upload-verification-video",
  protect,
  authorize("painter"),
  painterUpload.fields([
    {
      name: "verificationVideo",
      maxCount: 1,
    },
  ]),
  uploadVerificationVideo
);


router.get(
  "/me/status",
  protect,
  authorize("painter"),
  getPainterStatus
);



export default router;