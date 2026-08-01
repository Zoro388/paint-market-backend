// import Product from "../models/Product.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import cloudinary from "../config/cloudinary.js";

// export const createProduct =
//   asyncHandler(async (req, res) => {

//     if (
//       !req.files ||
//       req.files.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please upload at least one product image",
//       });
//     }

//     const uploadedImages = [];

//     for (const file of req.files) {

//       const result =
//         await cloudinary.uploader.upload(
//           `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
//           {
//             folder:
//               "paint-market/products",
//           }
//         );

//       uploadedImages.push(
//         result.secure_url
//       );
//     }

//     let questions = [];

//     if (req.body.questions) {
//       questions = JSON.parse(
//         req.body.questions
//       );
//     }

//     let productFeatures = [];

//     if (
//       req.body.productFeatures
//     ) {
//       productFeatures =
//         JSON.parse(
//           req.body.productFeatures
//         );
//     }

//     const product =
//       await Product.create({

//         productName:
//           req.body.productName,

//         productCategory:
//           req.body.productCategory,

//         productDescription:
//           req.body.productDescription,

//         colourCode:
//           req.body.colourCode,

//         colourName:
//           req.body.colourName,

//         hex:
//           req.body.hex,

//         price:
//           Number(req.body.price),

//         stockQuantity:
//           Number(
//             req.body.stockQuantity
//           ),

//         coverageInformation:
//           req.body.coverageInformation,

//         productFeatures,

//         questions,

//         status:
//           req.body.status,

//         productImages:
//           uploadedImages,

//       });

//     res.status(201).json({
//       success: true,
//       message:
//         "Product created successfully",
//       product,
//     });

//   });

// export const getProducts =
//   asyncHandler(async (req, res) => {
//     const products =
//       await Product.find();

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       products,
//     });
//   });

// export const getProduct =
//   asyncHandler(async (req, res) => {
//     const product =
//       await Product.findById(
//         req.params.id
//       );

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       product,
//     });
//   });
// export const updateProduct =
//   asyncHandler(async (req, res) => {

//     const product =
//       await Product.findById(
//         req.params.id
//       );

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Product not found",
//       });
//     }

//     let uploadedImages =
//       product.productImages;

//     // Upload new images only if provided
//     if (
//       req.files &&
//       req.files.length > 0
//     ) {

//       uploadedImages = [];

//       for (const file of req.files) {

//         const result =
//           await cloudinary.uploader.upload(
//             `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
//             {
//               folder:
//                 "paint-market/products",
//             }
//           );

//         uploadedImages.push(
//           result.secure_url
//         );
//       }
//     }

//     let questions =
//       product.questions;

//     if (req.body.questions) {
//       questions =
//         JSON.parse(
//           req.body.questions
//         );
//     }

//     let productFeatures =
//       product.productFeatures;

//     if (
//       req.body.productFeatures
//     ) {
//       productFeatures =
//         JSON.parse(
//           req.body.productFeatures
//         );
//     }

//     product.productName =
//       req.body.productName ??
//       product.productName;

//     product.productCategory =
//       req.body.productCategory ??
//       product.productCategory;

//     product.productDescription =
//       req.body.productDescription ??
//       product.productDescription;

//     product.colourCode =
//       req.body.colourCode ??
//       product.colourCode;

//     product.colourName =
//       req.body.colourName ??
//       product.colourName;

//     product.hex =
//       req.body.hex ??
//       product.hex;

//     product.price =
//       req.body.price ??
//       product.price;

//     product.stockQuantity =
//       req.body.stockQuantity ??
//       product.stockQuantity;

//     product.coverageInformation =
//       req.body.coverageInformation ??
//       product.coverageInformation;

//     product.status =
//       req.body.status ??
//       product.status;

//     product.productImages =
//       uploadedImages;

//     product.productFeatures =
//       productFeatures;

//     product.questions =
//       questions;

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message:
//         "Product updated successfully",
//       product,
//     });

//   });
// export const deleteProduct =
//   asyncHandler(async (req, res) => {
//     const product =
//       await Product.findById(
//         req.params.id
//       );

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Product not found",
//       });
//     }

//     await product.deleteOne();

//     res.status(200).json({
//       success: true,
//       message:
//         "Product deleted successfully",
//     });
//   });

  
//   export const increaseProductStock =
//   asyncHandler(async (req, res) => {

//     const { quantity } = req.body;

//     if (!quantity || quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be greater than zero",
//       });
//     }

//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     product.stockQuantity += Number(quantity);

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: "Product stock increased successfully",
//       product,
//     });

//   });

//   export const decreaseProductStock =
//   asyncHandler(async (req, res) => {

//     const { quantity } = req.body;

//     if (!quantity || quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be greater than zero",
//       });
//     }

//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     if (product.stockQuantity < quantity) {
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient stock available",
//       });
//     }

//     product.stockQuantity -= Number(quantity);

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: "Product stock decreased successfully",
//       product,
//     });

//   });








import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| Upload Image To Cloudinary
|--------------------------------------------------------------------------
*/

const uploadImage = async (file) => {

  const result =
    await cloudinary.uploader.upload(
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

export const createProduct =
asyncHandler(async (req, res) => {

  console.log("========== CREATE PRODUCT ==========");

  console.log("BODY:");
  console.log(req.body);

  console.log("FILES:");
  console.log(
    req.files?.map(file => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
    }))
  );

  /*
  |--------------------------------------------------------------------------
  | Validate Bucket Image
  |--------------------------------------------------------------------------
  */

  if (!req.files || req.files.length === 0) {

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

  const bucketImage =
    await uploadImage(req.files[0]);

  const bucketImages = [
    bucketImage.url,
  ];

  /*
  |--------------------------------------------------------------------------
  | Questions
  |--------------------------------------------------------------------------
  */

  let questions = [];

  if (req.body.questions) {

    questions =
      JSON.parse(req.body.questions);

  }

  /*
  |--------------------------------------------------------------------------
  | Product Features
  |--------------------------------------------------------------------------
  */

  let productFeatures = [];

  if (req.body.productFeatures) {

    productFeatures =
      JSON.parse(req.body.productFeatures);

  }

  /*
  |--------------------------------------------------------------------------
  | Variants (Optional)
  |--------------------------------------------------------------------------
  */

  const uploadedVariants = [];

  if (req.body.variants) {

    const variants =
      JSON.parse(req.body.variants);

    /*
    |--------------------------------------------------------------------------
    | Validate Variant Images
    |--------------------------------------------------------------------------
    */

    if (
      req.files.length - 1 !==
      variants.length
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Expected ${variants.length} colour image(s) but received ${req.files.length - 1}.`,

      });

    }

    /*
    |--------------------------------------------------------------------------
    | Upload Variant Images
    |--------------------------------------------------------------------------
    */

    for (
      let i = 0;
      i < variants.length;
      i++
    ) {

      const uploadedImage =
        await uploadImage(
          req.files[i + 1]
        );

      uploadedVariants.push({

        colourName:
          variants[i].colourName,

        colourCode:
          variants[i].colourCode,

        image: {

          url:
            uploadedImage.url,

          publicId:
            uploadedImage.publicId,

        },

      });

    }

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
  status: req.body.status,
  productImages: bucketImages,
  variants: uploadedVariants,
},
{ depth: null }
);
  const product =
    await Product.create({

      productName:
        req.body.productName,

      productCategory:
        req.body.productCategory,

      productDescription:
        req.body.productDescription,

      price:
        Number(req.body.price),

      coverageInformation:
        req.body.coverageInformation,

      productFeatures,

      questions,

      status:
        req.body.status,

      productImages:
        bucketImages,

      variants:
        uploadedVariants,

    });

  return res.status(201).json({

    success: true,

    message:
      "Product created successfully.",

    product,

  });

});

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

export const getProducts =
asyncHandler(async (req, res) => {

  const products =
    await Product.find()
    .sort({
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

export const getProduct =
asyncHandler(async (req, res) => {

  const product =
    await Product.findById(
      req.params.id
    );

  if (!product) {

    return res.status(404).json({

      success: false,

      message:
        "Product not found",

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
export const updateProduct =
asyncHandler(async (req, res) => {

  const product =
    await Product.findById(req.params.id);

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

    questions = JSON.parse(req.body.questions);

  }

  /*
  |--------------------------------------------------------------------------
  | Parse Product Features
  |--------------------------------------------------------------------------
  */

  let productFeatures = product.productFeatures;

  if (req.body.productFeatures) {

    productFeatures = JSON.parse(
      req.body.productFeatures
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Parse Variants
  |--------------------------------------------------------------------------
  */

  let variants = product.variants;

  if (req.body.variants) {

    variants = JSON.parse(req.body.variants);

  }

  /*
  |--------------------------------------------------------------------------
  | Files
  |--------------------------------------------------------------------------
  */

  const files = req.files || [];

  /*
  |--------------------------------------------------------------------------
  | Bucket Image
  |--------------------------------------------------------------------------
  */

  let bucketImages = product.productImages;

  if (files.length > 0) {

    const bucketUpload =
      await uploadImage(files[0]);

    bucketImages = [
      bucketUpload.url,
    ];

  }

  /*
  |--------------------------------------------------------------------------
  | Variant Images
  |--------------------------------------------------------------------------
  */

  let uploadedVariants = product.variants;

  const uploadedVariantFiles =
    files.slice(1);

  if (req.body.variants) {

    /*
    |--------------------------------------------------------------------------
    | Admin uploaded ALL variant images
    |--------------------------------------------------------------------------
    */

    if (
      uploadedVariantFiles.length > 0
    ) {

      if (
        uploadedVariantFiles.length !==
        variants.length
      ) {

        return res.status(400).json({

          success: false,

          message:
            `You uploaded ${uploadedVariantFiles.length} colour image(s) but there are ${variants.length} variants. Please upload all variant images.`,

        });

      }

      uploadedVariants = [];

      for (
        let i = 0;
        i < variants.length;
        i++
      ) {

        const uploaded =
          await uploadImage(
            uploadedVariantFiles[i]
          );

        uploadedVariants.push({

          colourName:
            variants[i].colourName,

          colourCode:
            variants[i].colourCode,

          image: {

            url: uploaded.url,

            publicId:
              uploaded.publicId,

          },

        });

      }

    }

    /*
    |--------------------------------------------------------------------------
    | No variant images uploaded
    |--------------------------------------------------------------------------
    */

    else {

      uploadedVariants =
        variants.map(
          (variant, index) => ({

            colourName:
              variant.colourName,

            colourCode:
              variant.colourCode,

            image:
              product.variants[index]
                ?.image,

          })
        );

    }

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

    message:
      "Product updated successfully.",

    product,

  });

});
/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

export const deleteProduct =
asyncHandler(async (req, res) => {

  const product =
    await Product.findById(
      req.params.id
    );

  if (!product) {

    return res.status(404).json({

      success: false,

      message:
        "Product not found",

    });

  }

  await product.deleteOne();

  res.status(200).json({

    success: true,

    message:
      "Product deleted successfully",

  });

});






// VARIANT

/*
|--------------------------------------------------------------------------
| ADD PRODUCT VARIANT
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| ADD PRODUCT VARIANT
|--------------------------------------------------------------------------
*/

export const addProductVariant =
asyncHandler(async (req, res) => {

    const product =
    await Product.findById(req.params.id);

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

    const uploaded =
    await uploadImage(req.file);

    /*
    |--------------------------------------------------------------------------
    | Ensure variants array exists
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(product.variants)) {

        product.variants = [];

    }

    product.variants.push({

        colourName:
            req.body.colourName,

        colourCode:
            req.body.colourCode,

        image: {

            url:
                uploaded.url,

            publicId:
                uploaded.publicId,

        },

    });

    /*
    |--------------------------------------------------------------------------
    | Tell Mongoose the array changed
    |--------------------------------------------------------------------------
    */

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

export const updateProductVariant =
asyncHandler(async(req,res)=>{

    const product=
    await Product.findById(
        req.params.id
    );

    if(!product){

        return res.status(404).json({

            success:false,

            message:"Product not found.",

        });

    }

    const variant=
    product.variants.id(
        req.params.variantId
    );

    if(!variant){

        return res.status(404).json({

            success:false,

            message:"Variant not found.",

        });

    }

    variant.colourName=
    req.body.colourName ??
    variant.colourName;

    variant.colourCode=
    req.body.colourCode ??
    variant.colourCode;

    /*
    |--------------------------------------------------------------------------
    | Replace Image
    |--------------------------------------------------------------------------
    */

    if(req.file){

        await cloudinary.uploader.destroy(
            variant.image.publicId
        );

        const uploaded=
        await uploadImage(req.file);

        variant.image={

            url:uploaded.url,

            publicId:
            uploaded.publicId,

        };

    }

    await product.save();

    res.status(200).json({

        success:true,

        message:
        "Variant updated successfully.",

        product,

    });

});


/*
|--------------------------------------------------------------------------
| DELETE PRODUCT VARIANT
|--------------------------------------------------------------------------
*/

export const deleteProductVariant =
asyncHandler(async(req,res)=>{

    const product=
    await Product.findById(
        req.params.id
    );

    if(!product){

        return res.status(404).json({

            success:false,

            message:"Product not found.",

        });

    }

    const variant=
    product.variants.id(
        req.params.variantId
    );

    if(!variant){

        return res.status(404).json({

            success:false,

            message:"Variant not found.",

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

        success:true,

        message:
        "Variant deleted successfully.",

        product,

    });

});