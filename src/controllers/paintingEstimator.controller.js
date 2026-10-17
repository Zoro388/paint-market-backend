
import PaintingEstimate from "../models/PaintingEstimate.js";
import PainterProfile from "../models/PainterProfile.js";

import {
  calculatePaintingEstimate,
} from "../services/paintingEstimator.service.js";

const PAINT_TYPES = [
  "Marble Trowel Paint",
  "Gravitex Paint",
  "Epoxy Floor Paint",
];

const BUILDING_TYPES = [
  "Bungalow",
  "Duplex",
  "Block of Flats",
];

const FINISH_LEVELS = [
  "Budget",
  "Mid-Range",
  "High-End",
];

const EXTRA_OPTIONS = [
  "Exterior Painting",
  "Ceiling Painting",
  "Fence / Perimeter Wall",
  "Gate Painting",
  "Doors & Frames",
  "Feature / Accent Walls",
  "Textured / Decorative Finish",
  "Waterproof / Damp Protection",
  "Repainting Existing Walls",
  "None",
];

const FRONTEND_PRICES = {
  "Marble Trowel Paint": {
    2: { low: 2250000, high: 2450000 },
    3: { low: 2750000, high: 3000000 },
    4: { low: 3250000, high: 3500000 },
    5: { low: 3800000, high: 4100000 },
    6: { low: 4200000, high: 4550000 },
  },
  "Gravitex Paint": {
    2: { low: 2250000, high: 2550000 },
    3: { low: 2950000, high: 3350000 },
    4: { low: 3750000, high: 4250000 },
    5: { low: 4650000, high: 5300000 },
    6: { low: 5550000, high: 6350000 },
  },
  "Epoxy Floor Paint": {
    2: { low: 1650000, high: 1950000 },
    3: { low: 2250000, high: 2650000 },
    4: { low: 2950000, high: 3450000 },
    5: { low: 3650000, high: 4250000 },
    6: { low: 4350000, high: 5100000 },
  },
};

const cleanString = (value) =>
  typeof value === "string" ? value.trim() : "";

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidObjectId = (id) =>
  /^[a-f\d]{24}$/i.test(id);

const getPainterStateRegex = (state) => {
  const normalizedState = cleanString(state);

  if (normalizedState.toLowerCase() === "fct - abuja") {
    return /^(FCT\s*-\s*Abuja|Abuja|FCT|Federal Capital Territory)$/i;
  }

  return new RegExp(`^${escapeRegex(normalizedState)}$`, "i");
};

const normalizeExtras = (extras) => {
  if (extras === undefined || extras === null) {
    return [];
  }

  if (!Array.isArray(extras)) {
    throw new Error("Extras must be provided as an array.");
  }

  const selected = [
    ...new Set(
      extras
        .filter((extra) => typeof extra === "string")
        .map((extra) => extra.trim())
        .filter(Boolean),
    ),
  ];

  const invalidExtras = selected.filter(
    (extra) => !EXTRA_OPTIONS.includes(extra),
  );

  if (invalidExtras.length > 0) {
    throw new Error(
      `Invalid painting option(s): ${invalidExtras.join(", ")}`,
    );
  }

  if (selected.includes("None") && selected.length > 1) {
    throw new Error(
      'Choose "None" by itself or select your required painting extras.',
    );
  }

  return selected;
};

/*
|--------------------------------------------------------------------------
| CREATE PAINTING ESTIMATE
|--------------------------------------------------------------------------
| Free estimate. No payment or unlock fee is required.
|--------------------------------------------------------------------------
*/

export const createPaintingEstimate = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      buildingType,
      bedrooms,
      paintType,
      finishLevel,
      location,
      state,
      lga,
      exactAddress,
      extras,
    } = req.body || {};

    const cleanedFullName = cleanString(fullName);
    const cleanedPhoneNumber = cleanString(phoneNumber);
    const cleanedEmail = cleanString(email).toLowerCase();
    const cleanedBuildingType = cleanString(buildingType);
    const cleanedPaintType = cleanString(paintType);

    // Accept the new state field and retain compatibility with
    // existing requests that send location.
    const cleanedState = cleanString(state || location);
    const cleanedLocation = cleanedState;
    const cleanedLga = cleanString(lga);
    const cleanedExactAddress = cleanString(exactAddress);

    const cleanedFinishLevel =
      cleanString(finishLevel) || "Mid-Range";

    if (
      !cleanedFullName ||
      !cleanedPhoneNumber ||
      !cleanedEmail ||
      !cleanedBuildingType ||
      bedrooms === undefined ||
      bedrooms === null ||
      bedrooms === "" ||
      !cleanedPaintType ||
      !cleanedState ||
      !cleanedLga ||
      !cleanedExactAddress
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete all required fields, including state, LGA, and exact property address.",
      });
    }

    if (!validateEmail(cleanedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (cleanedExactAddress.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a more complete property address.",
      });
    }

    if (!BUILDING_TYPES.includes(cleanedBuildingType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid building type.",
      });
    }

    if (!PAINT_TYPES.includes(cleanedPaintType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid paint type.",
      });
    }

    if (!FINISH_LEVELS.includes(cleanedFinishLevel)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid finishing level.",
      });
    }

    const bedroomCount = Number(bedrooms);

    if (![2, 3, 4, 5, 6].includes(bedroomCount)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid bedroom count.",
      });
    }

    const normalizedExtras = normalizeExtras(extras);

    /*
     * Retain the existing estimate calculation and pricing.
     * State, LGA, and address are saved as location details.
     */
    const calculation = calculatePaintingEstimate({
      bedrooms: bedroomCount,
      finishLevel: cleanedFinishLevel,
      location: cleanedLocation,
      extras: normalizedExtras,
    });

    const priceRange =
      FRONTEND_PRICES[cleanedPaintType]?.[bedroomCount];

    if (!priceRange) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to calculate a price for these selections.",
      });
    }

    const estimatedBudget = Math.round(
      (priceRange.low + priceRange.high) / 2,
    );

    const estimate = await PaintingEstimate.create({
      user: req.user?._id || null,

      fullName: cleanedFullName,
      phoneNumber: cleanedPhoneNumber,
      email: cleanedEmail,

      buildingType: cleanedBuildingType,
      bedrooms: bedroomCount,
      area: calculation.area,

      paintType: cleanedPaintType,
      finishLevel: cleanedFinishLevel,

      // Keep location for existing API consumers.
      location: cleanedState,

      // New property location details.
      state: cleanedState,
      lga: cleanedLga,
      exactAddress: cleanedExactAddress,

      extras: normalizedExtras,

      // Existing price ranges remain unchanged.
      lowEstimate: priceRange.low,
      highEstimate: priceRange.high,
      estimatedBudget,

      // Existing calculation breakdown.
      paintQuantity: calculation.paintQuantity,
      bucketQuantity: calculation.bucketQuantity,
      litresPerBucket: calculation.litresPerBucket,
      materialCost: calculation.materialCost,
      labourCost: calculation.labourCost,
      extrasCost: calculation.extrasCost,
      specification: calculation.specification,

      // Preserve legacy free-estimate fields.
      unlockFee: 0,
      currency: "NGN",
      paymentStatus: "paid",
      estimateStatus: "paid",
    });

    return res.status(201).json({
      success: true,
      message: "Free painting estimate created successfully.",
      paid: true,
      estimate: {
        ...estimate.toObject(),
        paid: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message.startsWith("Invalid ") ||
        error.message.startsWith("Extras must") ||
        error.message.startsWith('Choose "None"')
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Some estimate fields are invalid. Please review your selections.",
      });
    }

    console.error("Create painting estimate error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create painting estimate.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PAINTING ESTIMATE
|--------------------------------------------------------------------------
*/

export const getPaintingEstimate = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid painting estimate ID.",
      });
    }

    const estimate = await PaintingEstimate.findById(req.params.id);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: "Painting estimate not found.",
      });
    }

    return res.json({
      success: true,
      paid: true,
      estimate: {
        ...estimate.toObject(),
        paid: true,
      },
    });
  } catch (error) {
    console.error("Get painting estimate error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load painting estimate.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET APPROVED PAINTERS FOR AN ESTIMATE
|--------------------------------------------------------------------------
*/

export const getPaintingEstimatePainters = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid painting estimate ID.",
      });
    }

    const estimate = await PaintingEstimate.findById(
      req.params.id,
    ).select("location state");

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: "Painting estimate not found.",
      });
    }

    const painterState = estimate.state || estimate.location;
    const stateRegex = getPainterStateRegex(painterState);

    const painters = await PainterProfile.find({
      state: { $regex: stateRegex },
      approvalStatus: "approved",
      status: "active",
    })
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .sort({
        isFeatured: -1,
        averageRating: -1,
        completedJobs: -1,
        approvedAt: -1,
      });

    const formattedPainters = painters.map((painter) => {
      const name = painter.user
        ? `${painter.user.firstName || ""} ${
            painter.user.lastName || ""
          }`.trim()
        : "";

      return {
        id: painter._id.toString(),
        name: name || "Approved Painter",
        image: painter.profileImage?.url || "",
        description: painter.bio || "",
        experience: `${painter.yearsOfExperience || 0}+ years`,
        yearsOfExperience: painter.yearsOfExperience || 0,
        state: painter.state,
        city: painter.city,
        location: painter.city
          ? `${painter.city}, ${painter.state}`
          : painter.state,
        rating: Number(
          Number(painter.averageRating || 0).toFixed(1),
        ),
        totalReviews: painter.totalReviews || 0,
        completedJobs: painter.completedJobs || 0,
        availabilityStatus:
          painter.availabilityStatus || "offline",
        isFeatured: Boolean(painter.isFeatured),
        isVerified: Boolean(painter.isVerified),
        profileImage: painter.profileImage?.url || "",
        portfolioImages: painter.portfolioImages || [],
      };
    });

    return res.json({
      success: true,
      state: painterState,
      count: formattedPainters.length,
      painters: formattedPainters,
    });
  } catch (error) {
    console.error(
      "Get painting estimate painters error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load approved painters.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET PAINTING ESTIMATES
|--------------------------------------------------------------------------
*/

export const getAdminPaintingEstimates = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      100,
    );

    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) {
      filter.paymentStatus = req.query.status;
    }

    if (req.query.state) {
      filter.state = req.query.state;
    }

    const [estimates, total] = await Promise.all([
      PaintingEstimate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      PaintingEstimate.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      estimates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Get admin painting estimates error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load painting estimates.",
    });
  }
};
