import multer from "multer";

import {
CloudinaryStorage,
}
from
"multer-storage-cloudinary";

import cloudinary
from
"../config/cloudinary.js";

const storage =
new CloudinaryStorage({

cloudinary,

params: {

folder:
"paint-market/portfolio",

allowed_formats:[
"jpg",
"jpeg",
"png",
"webp",
],

},

});

const portfolioUpload =
multer({

storage,

limits:{
fileSize:
10*
1024*
1024,
},

});

export default portfolioUpload;