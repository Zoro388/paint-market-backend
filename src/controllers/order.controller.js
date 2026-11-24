// import Order from "../models/Order.js";
// import Product from "../models/Product.js";
// import asyncHandler from "../utils/asyncHandler.js";



// // ======================
// // CREATE ORDER
// // ======================

// export const createOrder =
// asyncHandler(async (
//   req,
//   res
// ) => {
//   console.log(
//     "========== CREATE ORDER =========="
//   );

//   console.log(
//     "REQ USER:",
//     JSON.stringify(
//       req.user,
//       null,
//       2
//     )
//   );

//   console.log(
//     "REQ BODY:",
//     JSON.stringify(
//       req.body,
//       null,
//       2
//     )
//   );

//   try {
//     const {
//       deliveryAddress,
//       state,
//       city,
//       paymentMethod,
//       paymentReference,
//       notes,
//       orderedProducts,
//     } = req.body;

//     if (
//       !orderedProducts ||
//       orderedProducts.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "No products selected",
//       });
//     }

//     let totalAmount = 0;

//     const processedProducts =
//       [];

//     for (const item of orderedProducts) {
//       console.log(
//         "ORDER ITEM:",
//         JSON.stringify(
//           item,
//           null,
//           2
//         )
//       );

//       console.log(
//         "PRODUCT ID:",
//         item.productId
//       );

//       const product =
//         await Product.findById(
//           item.productId
//         );

//       console.log(
//         "PRODUCT FOUND:",
//         product
//       );

//       if (!product) {
//         return res
//           .status(404)
//           .json({
//             success:
//               false,

//             message:
//               `Product not found: ${item.productId}`,
//           });
//       }

//       const subtotal =
//         product.price *
//         item.quantity;

//       totalAmount +=
//         subtotal;

//       processedProducts.push({
//         product:
//           product._id,

//         productName:
//           product.productName,

//         selectedColour:
//           item.selectedColour,

//         quantity:
//           item.quantity,

//         unitPrice:
//           product.price,

//         subtotal,
//       });
//     }

//     const order =
//       await Order.create({
//         user:
//           req.user._id,

//         customerName:
//           `${req.user.firstName} ${req.user.lastName}`,

//         email:
//           req.user.email,

//         phoneNumber:
//           req.user.phoneNumber,

//         deliveryAddress,

//         state,

//         city,

//         orderedProducts:
//           processedProducts,

//         totalAmount,

//         paymentMethod,

//         paymentReference:
//           paymentReference ||
//           "",

//         paymentStatus:
//           paymentReference
//             ? "paid"
//             : "pending",

//         notes,
//       });

//     console.log(
//       "ORDER CREATED:",
//       order._id
//     );

//     res.status(201).json({
//       success: true,

//       message:
//         "Order created successfully",

//       order,
//     });

//   } catch (error) {
//     console.error(
//       "CREATE ORDER ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,

//       message:
//         error.message,
//     });
//   }
// });


// export const getMyOrders = asyncHandler(
//   async (req, res) => {
//     const orders = await Order.find({
//       user: req.user._id,
//     })
//       .populate(
//         "orderedProducts.product",
//         "name images price slug"
//       )
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   }
// );



// // ======================
// // GET SINGLE ORDER
// // ======================

// export const getOrder =
// asyncHandler(async (
//   req,
//   res
// ) => {

//   const order =
//     await Order.findById(
//       req.params.id
//     );

//   if (!order) {
//     return res
//       .status(404)
//       .json({
//         success:
//           false,

//         message:
//           "Order not found",
//       });
//   }

//   const isOwner =
//     order.user.toString() ===
//     req.user._id.toString();

//   const isAdmin =
//     req.user.role ===
//     "admin";

//   if (
//     !isOwner &&
//     !isAdmin
//   ) {
//     return res
//       .status(403)
//       .json({
//         success:
//           false,

//         message:
//           "Access denied",
//       });
//   }

//   res.status(200).json({
//     success: true,

//     order,
//   });

// });




// // ======================
// // ADMIN GET ALL ORDERS
// // ======================

// export const getOrders =
// asyncHandler(async (
//   req,
//   res
// ) => {

//   const orders =
//     await Order.find()

//       .populate(
//         "user",
//         "firstName lastName email"
//       )

//       .sort({
//         createdAt:
//           -1,
//       });

//   res.status(200).json({
//     success: true,

//     count:
//       orders.length,

//     orders,
//   });

// });




// // ======================
// // UPDATE ORDER STATUS
// // ======================

// export const updateOrderStatus =
// asyncHandler(async (
//   req,
//   res
// ) => {

//   const order =
//     await Order.findById(
//       req.params.id
//     );

//   if (!order) {
//     return res
//       .status(404)
//       .json({
//         success:
//           false,

//         message:
//           "Order not found",
//       });
//   }

//   order.orderStatus =
//     req.body.orderStatus;

//   await order.save();

//   res.status(200).json({
//     success: true,

//     message:
//       "Order status updated",

//     order,
//   });

// });





import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Tool from "../models/Tool.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE ORDER
export const createOrder = asyncHandler(async (req, res) => {
  const {
    deliveryAddress,
    state,
    city,
    paymentMethod,
    paymentReference,
    notes,
    orderedProducts,
  } = req.body;

  if (
    !Array.isArray(orderedProducts) ||
    orderedProducts.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "No items selected",
    });
  }

  if (!deliveryAddress || !state || !city) {
    return res.status(400).json({
      success: false,
      message: "Delivery address, state and city are required",
    });
  }

  let totalAmount = 0;
  const processedProducts = [];

  for (const item of orderedProducts) {
    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Every item must have a valid quantity",
      });
    }

    const itemType = item.itemType || "product";

    if (itemType === "tool") {
      if (!item.toolId) {
        return res.status(400).json({
          success: false,
          message: "Tool ID is required",
        });
      }

      const tool = await Tool.findById(item.toolId);

      if (!tool) {
        return res.status(404).json({
          success: false,
          message: `Tool not found: ${item.toolId}`,
        });
      }

      if (
        typeof tool.price !== "number" ||
        !Number.isFinite(tool.price) ||
        tool.price <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Tool "${tool.name}" does not have a valid price`,
        });
      }

      const subtotal = tool.price * quantity;
      totalAmount += subtotal;

      processedProducts.push({
        itemType: "tool",
        tool: tool._id,
        productName: tool.name,
        selectedColour: "Default",
        quantity,
        unitPrice: tool.price,
        subtotal,
      });

      continue;
    }

    if (itemType !== "product" || !item.productId) {
      return res.status(400).json({
        success: false,
        message: "A valid product ID is required",
      });
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.productId}`,
      });
    }

    const selectedColour = item.selectedColour;

    const variantExists = product.variants?.some(
      (variant) => variant.colourName === selectedColour
    );

    if (!selectedColour || !variantExists) {
      return res.status(400).json({
        success: false,
        message: `Invalid colour selected for ${product.productName}`,
      });
    }

    const subtotal = product.price * quantity;
    totalAmount += subtotal;

    processedProducts.push({
      itemType: "product",
      product: product._id,
      productName: product.productName,
      selectedColour,
      quantity,
      unitPrice: product.price,
      subtotal,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    customerName: `${req.user.firstName} ${req.user.lastName}`,
    email: req.user.email,
    phoneNumber: req.user.phoneNumber,
    deliveryAddress,
    state,
    city,
    orderedProducts: processedProducts,
    totalAmount,
    paymentMethod,
    paymentReference: paymentReference || "",
    paymentStatus: paymentReference ? "paid" : "pending",
    notes: notes || "",
  });

  return res.status(201).json({
    success: true,
    message: "Order created successfully",
    order,
  });
});

// GET MY ORDERS
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate("orderedProducts.product")
    .populate("orderedProducts.tool")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// GET SINGLE ORDER
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("orderedProducts.product")
    .populate("orderedProducts.tool");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const isOwner =
    order.user.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ADMIN GET ALL ORDERS
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "firstName lastName email")
    .populate("orderedProducts.product")
    .populate("orderedProducts.tool")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// UPDATE ORDER STATUS
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  order.orderStatus = req.body.orderStatus;

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated",
    order,
  });
});
