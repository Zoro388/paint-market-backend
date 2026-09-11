import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import flutterwave from "../services/flutterwave.service.js";

/*
|--------------------------------------------------------------------------
| VERIFY FLUTTERWAVE PAYMENT
|--------------------------------------------------------------------------
*/

const verifyPayment = asyncHandler(async (req, res) => {
  const { transaction_id } = req.body;

  if (!transaction_id) {
    return res.status(400).json({
      success: false,
      message: "transaction_id is required.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | ASK FLUTTERWAVE TO VERIFY TRANSACTION
  |--------------------------------------------------------------------------
  */

  let flutterwaveResponse;

  try {
    flutterwaveResponse = await flutterwave.get(
      `/transactions/${transaction_id}/verify`
    );
  } catch (error) {
    console.error(
      "Flutterwave verification error:",
      error.response?.data || error.message
    );

    return res.status(400).json({
      success: false,
      message: "Unable to verify Flutterwave transaction.",
    });
  }

  const transaction =
    flutterwaveResponse.data?.data;

  if (!transaction) {
    return res.status(400).json({
      success: false,
      message: "Invalid Flutterwave transaction response.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK TRANSACTION STATUS
  |--------------------------------------------------------------------------
  */

  if (transaction.status !== "successful") {
    return res.status(400).json({
      success: false,
      message: "Flutterwave payment was not successful.",
      status: transaction.status,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK CURRENCY
  |--------------------------------------------------------------------------
  */

  if (transaction.currency !== "NGN") {
    return res.status(400).json({
      success: false,
      message: "Invalid payment currency.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND PAYMENT USING TX_REF
  |--------------------------------------------------------------------------
  */

  const payment = await Payment.findOne({
    reference: transaction.tx_ref,
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message:
        "Payment record not found for this transaction.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | GET ORDER
  |--------------------------------------------------------------------------
  */

  const order = await Order.findById(
    payment.order
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK REFERENCE
  |--------------------------------------------------------------------------
  */

  if (
    order.paymentReference !==
    transaction.tx_ref
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Transaction reference does not match the order.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK AMOUNT
  |--------------------------------------------------------------------------
  */

  const paidAmount = Number(
    transaction.amount
  );

  const orderAmount = Number(
    order.totalAmount
  );

  if (paidAmount < orderAmount) {
    return res.status(400).json({
      success: false,
      message:
        "Payment amount is less than the order amount.",
      expectedAmount: orderAmount,
      paidAmount,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | IDEMPOTENCY CHECK
  |--------------------------------------------------------------------------
  |
  | If frontend calls verification twice, we don't reduce stock twice.
  |
  */

  if (order.paymentStatus === "paid") {
    return res.status(200).json({
      success: true,
      message: "Payment has already been verified.",
      payment,
      order,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE PAYMENT
  |--------------------------------------------------------------------------
  */

  payment.status = "success";
  payment.transactionId = String(
    transaction.id || transaction_id
  );
  payment.paidAt = new Date();

  await payment.save();

  /*
  |--------------------------------------------------------------------------
  | UPDATE ORDER
  |--------------------------------------------------------------------------
  */

  order.paymentStatus = "paid";
  order.paymentReference =
    transaction.tx_ref;

  order.orderStatus = "processing";

  /*
  |--------------------------------------------------------------------------
  | REDUCE STOCK
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
      console.error(
        `Product ${item.product} not found while reducing stock.`
      );

      continue;
    }

    if (
      typeof product.stockQuantity ===
        "number"
    ) {
      product.stockQuantity -=
        item.quantity;

      if (product.stockQuantity < 0) {
        product.stockQuantity = 0;
      }

      await product.save();
    }
  }

  await order.save();

  /*
  |--------------------------------------------------------------------------
  | SUCCESS
  |--------------------------------------------------------------------------
  */

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    payment,
    order,
  });
});

/*
|--------------------------------------------------------------------------
| PAYMENT HISTORY
|--------------------------------------------------------------------------
*/

const paymentHistory = asyncHandler(
  async (req, res) => {
    const payments =
      await Payment.find({
        user: req.user._id,
      })
        .populate(
          "order",
          "customerName email totalAmount paymentStatus orderStatus createdAt"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  }
);

export {
  verifyPayment,
  paymentHistory,
};