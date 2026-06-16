import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Lead from "../models/Lead.js";
import PainterRequest from "../models/PainterRequest.js";
import SiteEstimator from "../models/SiteEstimator.js";
import Contact from "../models/Contact.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats =
  asyncHandler(async (req, res) => {

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalLeads,
      totalPainterRequests,
      totalEstimatorRequests,
      totalContacts,
      orders,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Lead.countDocuments(),
      PainterRequest.countDocuments(),
      SiteEstimator.countDocuments(),
      Contact.countDocuments(),
      Order.find({}, "totalAmount"),
    ]);

    const totalRevenue =
      orders.reduce(
        (sum, order) =>
          sum + (order.totalAmount || 0),
        0
      );

    res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalLeads,
        totalPainterRequests,
        totalEstimatorRequests,
        totalContacts,
      },
    });

  });