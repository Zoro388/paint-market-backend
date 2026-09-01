// import Payment from "../models/Payment.js";
// import Order from "../models/Order.js";
// import Product from "../models/Product.js";

// import asyncHandler from "../utils/asyncHandler.js";

// import paystack from "../services/paystack.service.js";


import crypto from "crypto";

import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

import asyncHandler from "../utils/asyncHandler.js";

import paystack from "../services/paystack.service.js";

/*
|--------------------------------------------------------------------------
| INITIALIZE PAYSTACK PAYMENT
|--------------------------------------------------------------------------
*/

export const initializePayment =
  asyncHandler(async (req, res) => {

    const { orderId } = req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate Order ID
    |--------------------------------------------------------------------------
    */

    if (!orderId) {

      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });

    }


    /*
    |--------------------------------------------------------------------------
    | Find Order
    |--------------------------------------------------------------------------
    */

    const order =
      await Order.findById(orderId);


    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });

    }


    /*
    |--------------------------------------------------------------------------
    | Ensure User Owns Order
    |--------------------------------------------------------------------------
    */

    if (
      order.user &&
      order.user.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to pay for this order.",
      });

    }


    /*
    |--------------------------------------------------------------------------
    | Prevent Paying Twice
    |--------------------------------------------------------------------------
    */

    if (
      order.paymentStatus ===
      "paid"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "This order has already been paid for.",
      });

    }


    /*
    |--------------------------------------------------------------------------
    | Initialize Payment With Paystack
    |--------------------------------------------------------------------------
    */

    const response =
      await paystack.post(
        "/transaction/initialize",
        {

          email:
            order.email,

          /*
          |--------------------------------------------------------------------------
          | Paystack expects amount in Kobo
          |--------------------------------------------------------------------------
          */

          amount:
            Math.round(
              Number(order.totalAmount) * 100
            ),

          /*
          |--------------------------------------------------------------------------
          | Metadata
          |--------------------------------------------------------------------------
          */

          metadata: {

            orderId:
              order._id.toString(),

            userId:
              req.user._id.toString(),

          },

        }
      );


    /*
    |--------------------------------------------------------------------------
    | Validate Paystack Response
    |--------------------------------------------------------------------------
    */

    if (
      !response.data ||
      !response.data.status ||
      !response.data.data
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Unable to initialize payment with Paystack.",

      });

    }


    const paystackData =
      response.data.data;


    /*
    |--------------------------------------------------------------------------
    | Create Payment Record
    |--------------------------------------------------------------------------
    */

    const payment =
      await Payment.create({

        user:
          req.user._id,

        order:
          order._id,

        reference:
          paystackData.reference,

        amount:
          order.totalAmount,

        email:
          order.email,

        status:
          "pending",

      });


    /*
    |--------------------------------------------------------------------------
    | Save Reference To Order
    |--------------------------------------------------------------------------
    */

    order.paymentReference =
      paystackData.reference;

    order.paymentStatus =
      "pending";

    await order.save();


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({

      success: true,

      message:
        "Payment initialized successfully.",

      authorization_url:
        paystackData.authorization_url,

      access_code:
        paystackData.access_code,

      reference:
        paystackData.reference,

      paymentId:
        payment._id,

    });

  });



/*
|--------------------------------------------------------------------------
| VERIFY PAYSTACK PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPayment =
  asyncHandler(async (req, res) => {

    const { reference } =
      req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate Reference
    |--------------------------------------------------------------------------
    */

    if (!reference) {

      return res.status(400).json({

        success: false,

        message:
          "Payment reference is required.",

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Find Payment
    |--------------------------------------------------------------------------
    */

    const payment =
      await Payment.findOne({
        reference,
      });


    if (!payment) {

      return res.status(404).json({

        success: false,

        message:
          "Payment record not found.",

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Ensure User Owns Payment
    |--------------------------------------------------------------------------
    */

    if (
      payment.user &&
      payment.user.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({

        success: false,

        message:
          "You are not authorized to verify this payment.",

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Get Order
    |--------------------------------------------------------------------------
    */

    const order =
      await Order.findById(
        payment.order
      );


    if (!order) {

      return res.status(404).json({

        success: false,

        message:
          "Order associated with this payment was not found.",

      });

    }


    /*
    |--------------------------------------------------------------------------
    | If Already Paid
    |--------------------------------------------------------------------------
    */

    if (
      order.paymentStatus ===
      "paid"
    ) {

      return res.status(200).json({

        success: true,

        message:
          "This payment has already been verified.",

        payment,

        order,

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Verify With Paystack
    |--------------------------------------------------------------------------
    */

    const response =
      await paystack.get(
        `/transaction/verify/${reference}`
      );


    /*
    |--------------------------------------------------------------------------
    | Validate Paystack Response
    |--------------------------------------------------------------------------
    */

    if (
      !response.data ||
      !response.data.status ||
      !response.data.data
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Unable to verify payment with Paystack.",

      });

    }


    const paystackData =
      response.data.data;


    /*
    |--------------------------------------------------------------------------
    | Verify Reference Matches
    |--------------------------------------------------------------------------
    */

    if (
      paystackData.reference !==
      reference
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payment reference mismatch.",

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Verify Payment Amount
    |--------------------------------------------------------------------------
    */

    const expectedAmount =
      Math.round(
        Number(order.totalAmount) * 100
      );


    if (
      Number(paystackData.amount) !==
      expectedAmount
    ) {

      payment.status =
        "failed";

      await payment.save();


      order.paymentStatus =
        "failed";

      await order.save();


      return res.status(400).json({

        success: false,

        message:
          "Payment amount verification failed.",

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Payment Successful
    |--------------------------------------------------------------------------
    */

    if (
      paystackData.status ===
      "success"
    ) {

      /*
      |--------------------------------------------------------------------------
      | Update Payment
      |--------------------------------------------------------------------------
      */

      payment.status =
  "success";

payment.transactionId =
  String(paystackData.id || "");

payment.paidAt =
  new Date();

await payment.save();


      /*
      |--------------------------------------------------------------------------
      | Update Order
      |--------------------------------------------------------------------------
      */

      order.paymentStatus =
        "paid";

      order.paymentReference =
        reference;

      await order.save();


      /*
      |--------------------------------------------------------------------------
      | Reduce Product Stock
      |--------------------------------------------------------------------------
      */

      for (
        const item of order.orderedProducts
      ) {

        const product =
          await Product.findById(
            item.product
          );


        if (!product) {

          continue;

        }


        /*
        |--------------------------------------------------------------------------
        | Check Stock Before Reduction
        |--------------------------------------------------------------------------
        */

        if (
          typeof product.stockQuantity ===
          "number"
        ) {

          if (
            product.stockQuantity <
            item.quantity
          ) {

            console.warn(

              `Insufficient stock for product ${product._id}`

            );

          } else {

            product.stockQuantity -=
              item.quantity;

            await product.save();

          }

        }

      }


      return res.status(200).json({

        success: true,

        message:
          "Payment verified successfully.",

        payment,

        order,

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Payment Not Successful
    |--------------------------------------------------------------------------
    */

    payment.status =
      "failed";

    await payment.save();


    order.paymentStatus =
      "failed";

    await order.save();


    return res.status(400).json({

      success: false,

      message:
        "Payment was not successful.",

      paymentStatus:
        paystackData.status,

    });

  });



/*
|--------------------------------------------------------------------------
| GET PAYMENT HISTORY
|--------------------------------------------------------------------------
*/

export const paymentHistory =
  asyncHandler(async (req, res) => {

    const payments =
      await Payment.find({

        user:
          req.user._id,

      })

      .populate({

        path:
          "order",

        select:
          "totalAmount paymentStatus orderStatus orderedProducts createdAt",

      })

      .sort({

        createdAt:
          -1,

      });


    res.status(200).json({

      success: true,

      count:
        payments.length,

      payments,

    });

  });

  /*
|--------------------------------------------------------------------------
| PAYSTACK WEBHOOK
|--------------------------------------------------------------------------
*/

export const paystackWebhook =
asyncHandler(async (
  req,
  res
) => {

  /*
  |--------------------------------------------------------------------------
  | GET PAYSTACK SIGNATURE
  |--------------------------------------------------------------------------
  */

  const signature =
    req.headers[
      "x-paystack-signature"
    ];


  /*
  |--------------------------------------------------------------------------
  | VERIFY SIGNATURE EXISTS
  |--------------------------------------------------------------------------
  */

  if (!signature) {

    return res.status(400).json({

      success: false,

      message:
        "Missing Paystack signature.",

    });

  }


  /*
  |--------------------------------------------------------------------------
  | VERIFY PAYSTACK SIGNATURE
  |--------------------------------------------------------------------------
  */

  const crypto =
    await import("crypto");


  const hash =
    crypto
      .createHmac(
        "sha512",
        process.env.PAYSTACK_SECRET_KEY
      )
      .update(req.body)
      .digest("hex");


  /*
  |--------------------------------------------------------------------------
  | Reject Invalid Webhook
  |--------------------------------------------------------------------------
  */

  if (
    hash !== signature
  ) {

    console.error(
      "INVALID PAYSTACK WEBHOOK SIGNATURE"
    );

    return res.status(401).json({

      success: false,

      message:
        "Invalid Paystack webhook signature.",

    });

  }


  /*
  |--------------------------------------------------------------------------
  | PARSE PAYSTACK EVENT
  |--------------------------------------------------------------------------
  */

  const event =
    JSON.parse(
      req.body.toString()
    );


  console.log(
    "PAYSTACK WEBHOOK EVENT:",
    event.event
  );


  /*
  |--------------------------------------------------------------------------
  | ONLY HANDLE SUCCESSFUL CHARGES
  |--------------------------------------------------------------------------
  */

  if (
    event.event !==
    "charge.success"
  ) {

    return res.status(200).json({

      success: true,

      message:
        "Webhook event received.",

    });

  }


  /*
  |--------------------------------------------------------------------------
  | GET PAYMENT DATA
  |--------------------------------------------------------------------------
  */

  const paymentData =
    event.data;


  const reference =
    paymentData.reference;


  /*
  |--------------------------------------------------------------------------
  | FIND PAYMENT
  |--------------------------------------------------------------------------
  */

  const payment =
    await Payment.findOne({

      reference,

    });


  if (!payment) {

    console.error(

      "PAYMENT NOT FOUND FOR WEBHOOK:",
      reference

    );

    /*
    |--------------------------------------------------------------------------
    | Return 200
    |--------------------------------------------------------------------------
    |
    | We do not want Paystack repeatedly
    | retrying an event forever.
    |
    */

    return res.status(200).json({

      success: true,

      message:
        "Payment record not found.",

    });

  }


  /*
  |--------------------------------------------------------------------------
  | FIND ORDER
  |--------------------------------------------------------------------------
  */

  const order =
    await Order.findById(
      payment.order
    );


  if (!order) {

    console.error(

      "ORDER NOT FOUND FOR PAYMENT:",
      reference

    );

    return res.status(200).json({

      success: true,

      message:
        "Order not found.",

    });

  }


  /*
  |--------------------------------------------------------------------------
  | IDEMPOTENCY CHECK
  |--------------------------------------------------------------------------
  |
  | Prevent duplicate webhook calls
  | from reducing stock twice.
  |
  */

  if (
    order.paymentStatus ===
    "paid"
  ) {

    console.log(

      "PAYMENT ALREADY PROCESSED:",
      reference

    );

    return res.status(200).json({

      success: true,

      message:
        "Payment already processed.",

    });

  }


  /*
  |--------------------------------------------------------------------------
  | VERIFY AMOUNT
  |--------------------------------------------------------------------------
  */

  const expectedAmount =
    Math.round(

      Number(
        order.totalAmount
      ) * 100

    );


  if (
    Number(
      paymentData.amount
    ) !==
    expectedAmount
  ) {

    console.error({

      message:
        "PAYMENT AMOUNT MISMATCH",

      expected:
        expectedAmount,

      received:
        paymentData.amount,

      reference,

    });


    payment.status =
      "failed";

    await payment.save();


    order.paymentStatus =
      "failed";

    await order.save();


    return res.status(200).json({

      success: true,

      message:
        "Payment amount mismatch handled.",

    });

  }


  /*
  |--------------------------------------------------------------------------
  | MARK PAYMENT SUCCESSFUL
  |--------------------------------------------------------------------------
  */

  payment.status =
    "success";

  payment.transactionId =
    String(
      paymentData.id || ""
    );

  payment.paidAt =
    new Date();


  await payment.save();


  /*
  |--------------------------------------------------------------------------
  | UPDATE ORDER
  |--------------------------------------------------------------------------
  */

  order.paymentStatus =
    "paid";

  order.paymentReference =
    reference;


  await order.save();


  /*
  |--------------------------------------------------------------------------
  | REDUCE PRODUCT STOCK
  |--------------------------------------------------------------------------
  */

  for (
    const item of
    order.orderedProducts
  ) {

    const product =
      await Product.findById(
        item.product
      );


    if (!product) {

      console.error(

        "PRODUCT NOT FOUND:",
        item.product

      );

      continue;

    }


    /*
    |--------------------------------------------------------------------------
    | Reduce Stock
    |--------------------------------------------------------------------------
    */

    if (
      typeof
      product.stockQuantity ===
      "number"
    ) {

      if (
        product.stockQuantity >=
        item.quantity
      ) {

        product.stockQuantity -=
          item.quantity;

        await product.save();

      } else {

        console.error({

          message:
            "INSUFFICIENT STOCK",

          product:
            product._id,

          available:
            product.stockQuantity,

          ordered:
            item.quantity,

        });

      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | WEBHOOK SUCCESS
  |--------------------------------------------------------------------------
  */

  console.log(

    "PAYSTACK PAYMENT PROCESSED SUCCESSFULLY:",

    reference

  );


  return res.status(200).json({

    success: true,

    message:
      "Payment processed successfully.",

  });

});