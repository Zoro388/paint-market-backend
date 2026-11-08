// import Product from "../models/Product.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import cloudinary from "../config/cloudinary.js";

// /*
// |--------------------------------------------------------------------------
// | Upload Image To Cloudinary
// |--------------------------------------------------------------------------
// */

// const uploadImage = async (file) => {

//   const result =
//     await cloudinary.uploader.upload(
//       `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
//       {
//         folder: "paint-market/products",
//       }
//     );

//   return {
//     url: result.secure_url,
//     publicId: result.public_id,
//   };

// };

// /*
// |--------------------------------------------------------------------------
// | CREATE PRODUCT
// |--------------------------------------------------------------------------
// */

// export const createProduct = asyncHandler(async (req, res) => {
//   console.log("========== CREATE PRODUCT ==========");
//   console.log("BODY:");
//   console.log(req.body);
//   console.log("FILES:");
//   console.log(
//     req.files?.map((file) => ({
//       fieldname: file.fieldname,
//       originalname: file.originalname,
//     }))
//   );

//   /*
//   |--------------------------------------------------------------------------
//   | Validate bucket image
//   |--------------------------------------------------------------------------
//   */

//   const bucketFile = req.files?.find(
//     (file) => file.fieldname === "productImages"
//   );

//   if (!bucketFile) {
//     return res.status(400).json({
//       success: false,
//       message: "Please upload the bucket image.",
//     });
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Upload bucket image
//   |--------------------------------------------------------------------------
//   */

//   const bucketImage = await uploadImage(bucketFile);

//   const bucketImages = [bucketImage.url];

//   /*
//   |--------------------------------------------------------------------------
//   | Parse questions
//   |--------------------------------------------------------------------------
//   */

//   let questions = [];

//   if (req.body.questions) {
//     try {
//       questions = JSON.parse(req.body.questions);
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid questions JSON.",
//       });
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Parse product features
//   |--------------------------------------------------------------------------
//   */

//   let productFeatures = [];

//   if (req.body.productFeatures) {
//     try {
//       productFeatures = JSON.parse(req.body.productFeatures);
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid productFeatures JSON.",
//       });
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Parse variants
//   |--------------------------------------------------------------------------
//   */

//   let variants = [];

//   if (req.body.variants) {
//     try {
//       variants = JSON.parse(req.body.variants);
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid variants JSON.",
//       });
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Upload variant images
//   |--------------------------------------------------------------------------
//   |
//   | Variant image field names from frontend:
//   |
//   | variantImage_new_0
//   | variantImage_new_1
//   | variantImage_<existing-id>
//   |
//   */

//   const uploadedVariants = [];

//   for (let i = 0; i < variants.length; i++) {
//     const variant = variants[i];

//     let variantImageFile = null;

//     /*
//      * Existing variant
//      */
//     if (variant._id) {
//       variantImageFile = req.files?.find(
//         (file) => file.fieldname === `variantImage_${variant._id}`
//       );
//     }

//     /*
//      * New variant
//      */
//     if (!variant._id) {
//       variantImageFile = req.files?.find(
//         (file) => file.fieldname === `variantImage_new_${i}`
//       );
//     }

//     let image = undefined;

//     /*
//      * Variant image is optional
//      */
//     if (variantImageFile) {
//       const uploadedImage = await uploadImage(variantImageFile);

//       image = {
//         url: uploadedImage.url,
//         publicId: uploadedImage.publicId,
//       };
//     }

//     /*
//      * The schema currently requires an image object.
//      * Therefore, if no image was uploaded, do not create
//      * the variant with a missing image.
//      */
//     if (!image) {
//       return res.status(400).json({
//         success: false,
//         message: `Please upload an image for the "${variant.colourName}" colour variant.`,
//       });
//     }

//     uploadedVariants.push({
//       colourName: variant.colourName,
//       colourCode: variant.colourCode,
//       image,
//     });
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Create product
//   |--------------------------------------------------------------------------
//   */

//   console.log("========== PRODUCT TO CREATE ==========");

//   console.dir(
//     {
//       productName: req.body.productName,
//       productCategory: req.body.productCategory,
//       productDescription: req.body.productDescription,
//       price: Number(req.body.price),
//       coverageInformation: req.body.coverageInformation,
//       productFeatures,
//       questions,
//       status: req.body.status,
//       productImages: bucketImages,
//       variants: uploadedVariants,
//     },
//     { depth: null }
//   );

//   const product = await Product.create({
//     productName: req.body.productName,
//     productCategory: req.body.productCategory,
//     productDescription: req.body.productDescription,
//     price: Number(req.body.price),
//     coverageInformation: req.body.coverageInformation,
//     productFeatures,
//     questions,
//     status: req.body.status,
//     productImages: bucketImages,
//     variants: uploadedVariants,
//   });

//   return res.status(201).json({
//     success: true,
//     message: "Product created successfully.",
//     product,
//   });
// });


// /*
// |--------------------------------------------------------------------------
// | GET ALL PRODUCTS
// |--------------------------------------------------------------------------
// */

// export const getProducts =
// asyncHandler(async (req, res) => {

//   const products =
//     await Product.find()
//     .sort({
//       createdAt: -1,
//     });

//   res.status(200).json({

//     success: true,

//     count: products.length,

//     products,

//   });

// });

// /*
// |--------------------------------------------------------------------------
// | GET SINGLE PRODUCT
// |--------------------------------------------------------------------------
// */

// export const getProduct =
// asyncHandler(async (req, res) => {

//   const product =
//     await Product.findById(
//       req.params.id
//     );

//   if (!product) {

//     return res.status(404).json({

//       success: false,

//       message:
//         "Product not found",

//     });

//   }

//   res.status(200).json({

//     success: true,

//     product,

//   });

// });

// /*
// |--------------------------------------------------------------------------
// | UPDATE PRODUCT
// |--------------------------------------------------------------------------
// */
// export const updateProduct =
// asyncHandler(async (req, res) => {

//     const product =
//     await Product.findById(req.params.id);

//     if (!product) {

//         return res.status(404).json({

//             success: false,

//             message: "Product not found",

//         });

//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Parse Questions
//     |--------------------------------------------------------------------------
//     */

//     let questions = product.questions;

//     if (req.body.questions) {

//         questions = JSON.parse(req.body.questions);

//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Parse Product Features
//     |--------------------------------------------------------------------------
//     */

//     let productFeatures = product.productFeatures;

//     if (req.body.productFeatures) {

//         productFeatures = JSON.parse(req.body.productFeatures);

//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Parse Variants
//     |--------------------------------------------------------------------------
//     */

//     let variants = product.variants;

//     if (req.body.variants) {

//         variants = JSON.parse(req.body.variants);

//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Separate Uploaded Files
//     |--------------------------------------------------------------------------
//     */

//     const files = req.files || [];

//     let bucketImageFile = null;

//     const variantFiles = {};

//     for (const file of files) {

//         if (file.fieldname === "productImages") {

//             bucketImageFile = file;

//         }

//         else if (

//             file.fieldname.startsWith(

//                 "variantImage_"

//             )

//         ) {

//             const key = file.fieldname.replace(

//                 "variantImage_",

//                 ""

//             );

//             variantFiles[key] = file;

//         }

//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Bucket Image
//     |--------------------------------------------------------------------------
//     */

//     let bucketImages = product.productImages;

//     if (bucketImageFile) {

//         const uploadedBucket =

//         await uploadImage(bucketImageFile);

//         bucketImages = [

//             uploadedBucket.url,

//         ];

//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Variants
//     |--------------------------------------------------------------------------
//     */

//     const uploadedVariants = [];

//     for (

//         let index = 0;

//         index < variants.length;

//         index++

//     ) {

//         const variant = variants[index];

//         let image = null;

//         /*
//         |--------------------------------------------------------------------------
//         | Existing Variant
//         |--------------------------------------------------------------------------
//         */

//         if (variant._id) {

//             const existing =

//             product.variants.id(

//                 variant._id

//             );

//             if (existing) {

//                 image = existing.image;

//             }

//         }

//         /*
//         |--------------------------------------------------------------------------
//         | Existing Variant Image Updated
//         |--------------------------------------------------------------------------
//         */

//         if (

//             variant._id &&

//             variantFiles[variant._id]

//         ) {

//             const uploaded =

//             await uploadImage(

//                 variantFiles[variant._id]

//             );

//             image = {

//                 url: uploaded.url,

//                 publicId:

//                 uploaded.publicId,

//             };

//         }

//         /*
//         |--------------------------------------------------------------------------
//         | New Variant
//         |--------------------------------------------------------------------------
//         */

//         if (

//             !variant._id &&

//             variantFiles[`new_${index}`]

//         ) {

//             const uploaded =

//             await uploadImage(

//                 variantFiles[`new_${index}`]

//             );

//             image = {

//                 url: uploaded.url,

//                 publicId:

//                 uploaded.publicId,

//             };

//         }

//         uploadedVariants.push({

//             colourName:

//             variant.colourName,

//             colourCode:

//             variant.colourCode,

//             image,

//         });

//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Update Product
//     |--------------------------------------------------------------------------
//     */

//     product.productName =

//     req.body.productName ??

//     product.productName;

//     product.productCategory =

//     req.body.productCategory ??

//     product.productCategory;

//     product.productDescription =

//     req.body.productDescription ??

//     product.productDescription;

//     product.price =

//     req.body.price ??

//     product.price;

//     product.coverageInformation =

//     req.body.coverageInformation ??

//     product.coverageInformation;

//     product.status =

//     req.body.status ??

//     product.status;

//     product.productImages =

//     bucketImages;

//     product.productFeatures =

//     productFeatures;

//     product.questions =

//     questions;

//     product.variants =

//     uploadedVariants;

//     await product.save();

//     res.status(200).json({

//         success: true,

//         message:

//         "Product updated successfully.",

//         product,

//     });

// });


// /*
// |--------------------------------------------------------------------------
// | DELETE PRODUCT
// |--------------------------------------------------------------------------
// */

// export const deleteProduct =
// asyncHandler(async (req, res) => {

//   const product =
//     await Product.findById(
//       req.params.id
//     );

//   if (!product) {

//     return res.status(404).json({

//       success: false,

//       message:
//         "Product not found",

//     });

//   }

//   await product.deleteOne();

//   res.status(200).json({

//     success: true,

//     message:
//       "Product deleted successfully",

//   });

// });






// // VARIANT

// /*
// |--------------------------------------------------------------------------
// | ADD PRODUCT VARIANT
// |--------------------------------------------------------------------------
// */

// /*
// |--------------------------------------------------------------------------
// | ADD PRODUCT VARIANT
// |--------------------------------------------------------------------------
// */

// export const addProductVariant =
// asyncHandler(async (req, res) => {

//     const product =
//     await Product.findById(req.params.id);

//     if (!product) {

//         return res.status(404).json({
//             success: false,
//             message: "Product not found",
//         });

//     }

//     if (!req.file) {

//         return res.status(400).json({
//             success: false,
//             message: "Variant image is required.",
//         });

//     }

//     const uploaded =
//     await uploadImage(req.file);

//     /*
//     |--------------------------------------------------------------------------
//     | Ensure variants array exists
//     |--------------------------------------------------------------------------
//     */

//     if (!Array.isArray(product.variants)) {

//         product.variants = [];

//     }

//     product.variants.push({

//         colourName:
//             req.body.colourName,

//         colourCode:
//             req.body.colourCode,

//         image: {

//             url:
//                 uploaded.url,

//             publicId:
//                 uploaded.publicId,

//         },

//     });

//     /*
//     |--------------------------------------------------------------------------
//     | Tell Mongoose the array changed
//     |--------------------------------------------------------------------------
//     */

//     product.markModified("variants");

//     await product.save();

//     res.status(201).json({

//         success: true,

//         message: "Variant added successfully.",

//         product,

//     });

// });


// /*
// |--------------------------------------------------------------------------
// | UPDATE PRODUCT VARIANT
// |--------------------------------------------------------------------------
// */

// export const updateProductVariant =
// asyncHandler(async(req,res)=>{

//     const product=
//     await Product.findById(
//         req.params.id
//     );

//     if(!product){

//         return res.status(404).json({

//             success:false,

//             message:"Product not found.",

//         });

//     }

//     const variant=
//     product.variants.id(
//         req.params.variantId
//     );

//     if(!variant){

//         return res.status(404).json({

//             success:false,

//             message:"Variant not found.",

//         });

//     }

//     variant.colourName=
//     req.body.colourName ??
//     variant.colourName;

//     variant.colourCode=
//     req.body.colourCode ??
//     variant.colourCode;

//     /*
//     |--------------------------------------------------------------------------
//     | Replace Image
//     |--------------------------------------------------------------------------
//     */

//     if(req.file){

//         await cloudinary.uploader.destroy(
//             variant.image.publicId
//         );

//         const uploaded=
//         await uploadImage(req.file);

//         variant.image={

//             url:uploaded.url,

//             publicId:
//             uploaded.publicId,

//         };

//     }

//     await product.save();

//     res.status(200).json({

//         success:true,

//         message:
//         "Variant updated successfully.",

//         product,

//     });

// });


// /*
// |--------------------------------------------------------------------------
// | DELETE PRODUCT VARIANT
// |--------------------------------------------------------------------------
// */

// export const deleteProductVariant =
// asyncHandler(async(req,res)=>{

//     const product=
//     await Product.findById(
//         req.params.id
//     );

//     if(!product){

//         return res.status(404).json({

//             success:false,

//             message:"Product not found.",

//         });

//     }

//     const variant=
//     product.variants.id(
//         req.params.variantId
//     );

//     if(!variant){

//         return res.status(404).json({

//             success:false,

//             message:"Variant not found.",

//         });

//     }

//     await cloudinary.uploader.destroy(
//         variant.image.publicId
//     );

//     product.variants.pull(
//         req.params.variantId
//     );

//     await product.save();

//     res.status(200).json({

//         success:true,

//         message:
//         "Variant deleted successfully.",

//         product,

//     });

// });





import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| STOCK AND FULFILMENT OPTIONS
|--------------------------------------------------------------------------
*/

const STOCK_AVAILABILITY_OPTIONS = [
  "available",
  "out_of_stock",
];

const FULFILMENT_TYPE_OPTIONS = [
  "ready_stock",
  "made_to_order",
];

/*
|--------------------------------------------------------------------------
| Upload Image To Cloudinary
|--------------------------------------------------------------------------
*/

const uploadImage = async (file) => {
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder: "paint-market/products",
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

export const createProduct = asyncHandler(async (req, res) => {
  console.log("========== CREATE PRODUCT ==========");
  console.log("BODY:");
  console.log(req.body);
  console.log("FILES:");
  console.log(
    req.files?.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
    }))
  );

  /*
  |--------------------------------------------------------------------------
  | Validate Stock Availability
  |--------------------------------------------------------------------------
  */

  const stockAvailability =
    req.body.stockAvailability || "available";

  if (!STOCK_AVAILABILITY_OPTIONS.includes(stockAvailability)) {
    return res.status(400).json({
      success: false,
      message: "Invalid stock availability.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Fulfilment Type
  |--------------------------------------------------------------------------
  */

  const fulfilmentType =
    req.body.fulfilmentType || "ready_stock";

  if (!FULFILMENT_TYPE_OPTIONS.includes(fulfilmentType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid fulfilment type.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Bucket Image
  |--------------------------------------------------------------------------
  */

  const bucketFile = req.files?.find(
    (file) => file.fieldname === "productImages"
  );

  if (!bucketFile) {
    return res.status(400).json({
      success: false,
      message: "Please upload the bucket image.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Upload Bucket Image
  |--------------------------------------------------------------------------
  */

  const bucketImage = await uploadImage(bucketFile);

  const bucketImages = [bucketImage.url];

  /*
  |--------------------------------------------------------------------------
  | Parse Questions
  |--------------------------------------------------------------------------
  */

  let questions = [];

  if (req.body.questions) {
    try {
      questions = JSON.parse(req.body.questions);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid questions JSON.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Parse Product Features
  |--------------------------------------------------------------------------
  */

  let productFeatures = [];

  if (req.body.productFeatures) {
    try {
      productFeatures = JSON.parse(req.body.productFeatures);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid productFeatures JSON.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Parse Variants
  |--------------------------------------------------------------------------
  */

  let variants = [];

  if (req.body.variants) {
    try {
      variants = JSON.parse(req.body.variants);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid variants JSON.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Upload Variant Images
  |--------------------------------------------------------------------------
  |
  | Variant image field names from frontend:
  |
  | variantImage_new_0
  | variantImage_new_1
  | variantImage_<existing-id>
  |
  */

  const uploadedVariants = [];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];

    let variantImageFile = null;

    /*
     * Existing variant
     */

    if (variant._id) {
      variantImageFile = req.files?.find(
        (file) => file.fieldname === `variantImage_${variant._id}`
      );
    }

    /*
     * New variant
     */

    if (!variant._id) {
      variantImageFile = req.files?.find(
        (file) => file.fieldname === `variantImage_new_${i}`
      );
    }

    let image = undefined;

    /*
     * Variant image is optional
     */

    if (variantImageFile) {
      const uploadedImage = await uploadImage(variantImageFile);

      image = {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
      };
    }

    /*
     * The schema requires an image object.
     * Do not create a variant with a missing image.
     */

    if (!image) {
      return res.status(400).json({
        success: false,
        message: `Please upload an image for the "${variant.colourName}" colour variant.`,
      });
    }

    uploadedVariants.push({
      colourName: variant.colourName,
      colourCode: variant.colourCode,
      image,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Create Product
  |--------------------------------------------------------------------------
  */

  console.log("========== PRODUCT TO CREATE ==========");

  console.dir(
    {
      productName: req.body.productName,
      productCategory: req.body.productCategory,
      productDescription: req.body.productDescription,
      price: Number(req.body.price),
      coverageInformation: req.body.coverageInformation,
      productFeatures,
      questions,
      stockAvailability,
      fulfilmentType,
      status: req.body.status,
      productImages: bucketImages,
      variants: uploadedVariants,
    },
    { depth: null }
  );

  const product = await Product.create({
    productName: req.body.productName,
    productCategory: req.body.productCategory,
    productDescription: req.body.productDescription,
    price: Number(req.body.price),
    coverageInformation: req.body.coverageInformation,
    productFeatures,
    questions,
    stockAvailability,
    fulfilmentType,
    status: req.body.status,
    productImages: bucketImages,
    variants: uploadedVariants,
  });

  return res.status(201).json({
    success: true,
    message: "Product created successfully.",
    product,
  });
});

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT
|--------------------------------------------------------------------------
*/

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    product,
  });
});

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Parse Questions
  |--------------------------------------------------------------------------
  */

  let questions = product.questions;

  if (req.body.questions) {
    try {
      questions = JSON.parse(req.body.questions);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid questions JSON.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Parse Product Features
  |--------------------------------------------------------------------------
  */

  let productFeatures = product.productFeatures;

  if (req.body.productFeatures) {
    try {
      productFeatures = JSON.parse(req.body.productFeatures);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid productFeatures JSON.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Parse Variants
  |--------------------------------------------------------------------------
  */

  let variants = product.variants;

  if (req.body.variants) {
    try {
      variants = JSON.parse(req.body.variants);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid variants JSON.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Stock Availability
  |--------------------------------------------------------------------------
  */

  if (req.body.stockAvailability !== undefined) {
    if (
      !STOCK_AVAILABILITY_OPTIONS.includes(
        req.body.stockAvailability
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock availability.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Fulfilment Type
  |--------------------------------------------------------------------------
  */

  if (req.body.fulfilmentType !== undefined) {
    if (
      !FULFILMENT_TYPE_OPTIONS.includes(
        req.body.fulfilmentType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid fulfilment type.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Separate Uploaded Files
  |--------------------------------------------------------------------------
  */

  const files = req.files || [];

  let bucketImageFile = null;

  const variantFiles = {};

  for (const file of files) {
    if (file.fieldname === "productImages") {
      bucketImageFile = file;
    } else if (file.fieldname.startsWith("variantImage_")) {
      const key = file.fieldname.replace(
        "variantImage_",
        ""
      );

      variantFiles[key] = file;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Bucket Image
  |--------------------------------------------------------------------------
  */

  let bucketImages = product.productImages;

  if (bucketImageFile) {
    const uploadedBucket = await uploadImage(bucketImageFile);

    bucketImages = [
      uploadedBucket.url,
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | Variants
  |--------------------------------------------------------------------------
  */

  const uploadedVariants = [];

  for (
    let index = 0;
    index < variants.length;
    index++
  ) {
    const variant = variants[index];

    let image = null;

    /*
    |--------------------------------------------------------------------------
    | Existing Variant
    |--------------------------------------------------------------------------
    */

    if (variant._id) {
      const existing = product.variants.id(
        variant._id
      );

      if (existing) {
        image = existing.image;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Existing Variant Image Updated
    |--------------------------------------------------------------------------
    */

    if (
      variant._id &&
      variantFiles[variant._id]
    ) {
      const uploaded = await uploadImage(
        variantFiles[variant._id]
      );

      image = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | New Variant
    |--------------------------------------------------------------------------
    */

    if (
      !variant._id &&
      variantFiles[`new_${index}`]
    ) {
      const uploaded = await uploadImage(
        variantFiles[`new_${index}`]
      );

      image = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    uploadedVariants.push({
      colourName: variant.colourName,
      colourCode: variant.colourCode,
      image,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Update Product
  |--------------------------------------------------------------------------
  */

  product.productName =
    req.body.productName ??
    product.productName;

  product.productCategory =
    req.body.productCategory ??
    product.productCategory;

  product.productDescription =
    req.body.productDescription ??
    product.productDescription;

  product.price =
    req.body.price ??
    product.price;

  product.coverageInformation =
    req.body.coverageInformation ??
    product.coverageInformation;

  product.status =
    req.body.status ??
    product.status;

  product.stockAvailability =
    req.body.stockAvailability ??
    product.stockAvailability;

  product.fulfilmentType =
    req.body.fulfilmentType ??
    product.fulfilmentType;

  product.productImages =
    bucketImages;

  product.productFeatures =
    productFeatures;

  product.questions =
    questions;

  product.variants =
    uploadedVariants;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully.",
    product,
  });
});

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(
    req.params.id
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

/*
|--------------------------------------------------------------------------
| ADD PRODUCT VARIANT
|--------------------------------------------------------------------------
*/

export const addProductVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Variant image is required.",
    });
  }

  const uploaded = await uploadImage(req.file);

  /*
  |--------------------------------------------------------------------------
  | Ensure Variants Array Exists
  |--------------------------------------------------------------------------
  */

  if (!Array.isArray(product.variants)) {
    product.variants = [];
  }

  product.variants.push({
    colourName: req.body.colourName,
    colourCode: req.body.colourCode,
    image: {
      url: uploaded.url,
      publicId: uploaded.publicId,
    },
  });

  product.markModified("variants");

  await product.save();

  res.status(201).json({
    success: true,
    message: "Variant added successfully.",
    product,
  });
});

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT VARIANT
|--------------------------------------------------------------------------
*/

export const updateProductVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(
    req.params.id
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const variant = product.variants.id(
    req.params.variantId
  );

  if (!variant) {
    return res.status(404).json({
      success: false,
      message: "Variant not found.",
    });
  }

  variant.colourName =
    req.body.colourName ??
    variant.colourName;

  variant.colourCode =
    req.body.colourCode ??
    variant.colourCode;

  /*
  |--------------------------------------------------------------------------
  | Replace Image
  |--------------------------------------------------------------------------
  */

  if (req.file) {
    await cloudinary.uploader.destroy(
      variant.image.publicId
    );

    const uploaded = await uploadImage(req.file);

    variant.image = {
      url: uploaded.url,
      publicId: uploaded.publicId,
    };
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "Variant updated successfully.",
    product,
  });
});

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT VARIANT
|--------------------------------------------------------------------------
*/

export const deleteProductVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(
    req.params.id
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const variant = product.variants.id(
    req.params.variantId
  );

  if (!variant) {
    return res.status(404).json({
      success: false,
      message: "Variant not found.",
    });
  }

  await cloudinary.uploader.destroy(
    variant.image.publicId
  );

  product.variants.pull(
    req.params.variantId
  );

  await product.save();

  res.status(200).json({
    success: true,
    message: "Variant deleted successfully.",
    product,
  });
});
