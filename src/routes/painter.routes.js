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

router.get(

"/approved",

protect,

authorize("admin"),

getApprovedPainters

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

export default router;