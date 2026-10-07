import PaintingEstimate from "../models/PaintingEstimate.js";
import PainterProfile from "../models/PainterProfile.js";

import {
  calculatePaintingEstimate,
} from "../services/paintingEstimator.service.js";

import {
  PAINTING_ESTIMATE_UNLOCK_FEE,
  initializePaintingEstimatePayment,
  verifyPaintingEstimatePayment,
} from "../services/paintingEstimatePayment.service.js";


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const cleanString = (value) => {
  return typeof value === "string"
    ? value.trim()
    : "";
};


const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
};


const publicEstimateFields = {
  fullName: 1,
  phoneNumber: 1,
  email: 1,
  buildingType: 1,
  bedrooms: 1,
  area: 1,
  paintType: 1,
  finishLevel: 1,
  location: 1,
  extras: 1,
  paintQuantity: 1,
  bucketQuantity: 1,
  litresPerBucket: 1,
  materialCost: 1,
  labourCost: 1,
  extrasCost: 1,
  estimatedBudget: 1,
  lowEstimate: 1,
  highEstimate: 1,
  specification: 1,
  currency: 1,
  paymentStatus: 1,
  estimateStatus: 1,
  paidAt: 1,
  createdAt: 1,
};


/*
|--------------------------------------------------------------------------
| Painter State Matching
|--------------------------------------------------------------------------
|
| The estimator uses "FCT - Abuja".
|
| Existing painter profiles may contain:
| - FCT - Abuja
| - Abuja
| - FCT
| - Federal Capital Territory
|
| We support all of those without modifying PainterProfile.
|--------------------------------------------------------------------------
*/

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
};


const getPainterStateRegex = (state) => {
  const normalizedState = cleanString(
    state,
  );

  if (
    normalizedState.toLowerCase() ===
    "fct - abuja".toLowerCase()
  ) {
    return /^(FCT\s*-\s*Abuja|Abuja|FCT|Federal Capital Territory)$/i;
  }

  return new RegExp(
    `^${escapeRegex(normalizedState)}$`,
    "i",
  );
};


/*
|--------------------------------------------------------------------------
| CREATE PAINTING ESTIMATE
|--------------------------------------------------------------------------
*/

export const createPaintingEstimate = async (
  req,
  res,
) => {
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
      extras,
    } = req.body;


    const cleanedFullName =
      cleanString(fullName);

    const cleanedPhoneNumber =
      cleanString(phoneNumber);

    const cleanedEmail =
      cleanString(email).toLowerCase();

    const cleanedBuildingType =
      cleanString(buildingType);

    const cleanedPaintType =
      cleanString(paintType);

    const cleanedFinishLevel =
      cleanString(finishLevel);

    const cleanedLocation =
      cleanString(location);


    /*
    |--------------------------------------------------------------------------
    | Required field validation
    |--------------------------------------------------------------------------
    */

    if (
      !cleanedFullName ||
      !cleanedPhoneNumber ||
      !cleanedEmail ||
      !cleanedBuildingType ||
      !bedrooms ||
      !cleanedPaintType ||
      !cleanedFinishLevel ||
      !cleanedLocation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete all required fields.",
      });
    }


    if (!validateEmail(cleanedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Server-side calculation
    |--------------------------------------------------------------------------
    */

    const calculation =
      calculatePaintingEstimate({
        bedrooms: Number(bedrooms),
        finishLevel:
          cleanedFinishLevel,
        location:
          cleanedLocation,
        extras:
          Array.isArray(extras)
            ? extras
            : [],
      });


    /*
    |--------------------------------------------------------------------------
    | Normalize extras
    |--------------------------------------------------------------------------
    */

    let normalizedExtras =
      Array.isArray(extras)
        ? extras.filter(Boolean)
        : [];


    if (
      normalizedExtras.includes("None")
    ) {
      normalizedExtras = ["None"];
    }


    /*
    |--------------------------------------------------------------------------
    | Create estimate
    |--------------------------------------------------------------------------
    */

    const estimate =
      await PaintingEstimate.create({
        user:
          req.user?._id || null,

        fullName:
          cleanedFullName,

        phoneNumber:
          cleanedPhoneNumber,

        email:
          cleanedEmail,

        buildingType:
          cleanedBuildingType,

        bedrooms:
          Number(bedrooms),

        area:
          calculation.area,

        paintType:
          cleanedPaintType,

        finishLevel:
          cleanedFinishLevel,

        location:
          cleanedLocation,

        extras:
          normalizedExtras,

        ...calculation,

        unlockFee:
          PAINTING_ESTIMATE_UNLOCK_FEE,

        currency:
          "NGN",

        paymentStatus:
          "pending",

        estimateStatus:
          "created",
      });


    /*
    |--------------------------------------------------------------------------
    | Return locked estimate information
    |--------------------------------------------------------------------------
    |
    | Financial details are NOT returned before payment.
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        "Painting estimate created successfully.",

      estimate: {
        id:
          estimate._id,

        fullName:
          estimate.fullName,

        phoneNumber:
          estimate.phoneNumber,

        email:
          estimate.email,

        buildingType:
          estimate.buildingType,

        bedrooms:
          estimate.bedrooms,

        area:
          estimate.area,

        paintType:
          estimate.paintType,

        finishLevel:
          estimate.finishLevel,

        location:
          estimate.location,

        extras:
          estimate.extras,

        unlockFee:
          PAINTING_ESTIMATE_UNLOCK_FEE,

        currency:
          "NGN",

        paymentStatus:
          estimate.paymentStatus,

        estimateStatus:
          estimate.estimateStatus,
      },
    });
  } catch (error) {
    console.error(
      "Create painting estimate error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create painting estimate.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| INITIALIZE PAINTING ESTIMATE PAYMENT
|--------------------------------------------------------------------------
*/

export const initializePaintingEstimate =
  async (
    req,
    res,
  ) => {
    try {
      const estimate =
        await PaintingEstimate.findById(
          req.params.id,
        );


      if (!estimate) {
        return res.status(404).json({
          success: false,
          message:
            "Painting estimate not found.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | Already paid
      |--------------------------------------------------------------------------
      */

      if (
        estimate.paymentStatus ===
        "paid"
      ) {
        return res.json({
          success: true,
          paid: true,
          message:
            "This estimate has already been paid.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | Initialize Flutterwave
      |--------------------------------------------------------------------------
      */

      const payment =
        await initializePaintingEstimatePayment({
          estimateId:
            estimate._id.toString(),

          email:
            estimate.email,

          fullName:
            estimate.fullName,

          phoneNumber:
            estimate.phoneNumber,
        });


      /*
      |--------------------------------------------------------------------------
      | Store transaction reference
      |--------------------------------------------------------------------------
      */

      estimate.paymentReference =
        payment.txRef;

      estimate.paymentStatus =
        "pending";

      await estimate.save();


      return res.json({
        success: true,
        paid: false,
        payment,
      });
    } catch (error) {
      console.error(
        "Initialize painting estimate payment error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to initialize payment.",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| VERIFY PAINTING ESTIMATE PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPaintingEstimate =
  async (
    req,
    res,
  ) => {
    try {
      const {
        transactionId,
      } = req.body;


      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message:
            "Transaction ID is required.",
        });
      }


      const estimate =
        await PaintingEstimate.findById(
          req.params.id,
        );


      if (!estimate) {
        return res.status(404).json({
          success: false,
          message:
            "Painting estimate not found.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | Already paid
      |--------------------------------------------------------------------------
      */

      if (
        estimate.paymentStatus ===
        "paid"
      ) {
        return res.json({
          success: true,
          paid: true,
          estimate,
        });
      }


      /*
      |--------------------------------------------------------------------------
      | Verify transaction directly with Flutterwave
      |--------------------------------------------------------------------------
      */

      const transaction =
        await verifyPaintingEstimatePayment(
          transactionId,
        );


      const expectedReference =
        estimate.paymentReference;


      const validStatus =
        transaction.status ===
        "successful";


      const validReference =
        transaction.tx_ref ===
        expectedReference;


      const validCurrency =
        String(
          transaction.currency || "",
        ).toUpperCase() === "NGN";


      /*
      |--------------------------------------------------------------------------
      | Require the exact unlock fee
      |--------------------------------------------------------------------------
      |
      | Do not accept a transaction merely because it is larger.
      |--------------------------------------------------------------------------
      */

      const validAmount =
        Number(transaction.amount) ===
        Number(
          PAINTING_ESTIMATE_UNLOCK_FEE,
        );


      if (
        !validStatus ||
        !validReference ||
        !validCurrency ||
        !validAmount
      ) {
        estimate.paymentStatus =
          "failed";

        await estimate.save();

        return res.status(400).json({
          success: false,
          paid: false,
          message:
            "Payment could not be verified.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | Mark estimate as paid
      |--------------------------------------------------------------------------
      */

      estimate.paymentStatus =
        "paid";

      estimate.estimateStatus =
        "paid";

      estimate.paymentTransactionId =
        String(transaction.id);

      estimate.paidAt =
        new Date();


      await estimate.save();


      return res.json({
        success: true,
        paid: true,

        message:
          "Payment verified successfully.",

        estimate,
      });
    } catch (error) {
      console.error(
        "Verify painting estimate payment error:",
        error,
      );

      return res.status(500).json({
        success: false,
        paid: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| GET PAINTING ESTIMATE
|--------------------------------------------------------------------------
|
| Before payment:
|   Only project selections are returned.
|
| After payment:
|   Full estimate is returned.
|--------------------------------------------------------------------------
*/

export const getPaintingEstimate =
  async (
    req,
    res,
  ) => {
    try {
      const estimate =
        await PaintingEstimate.findById(
          req.params.id,
        ).select(
          publicEstimateFields,
        );


      if (!estimate) {
        return res.status(404).json({
          success: false,
          message:
            "Painting estimate not found.",
        });
      }


      const isPaid =
        estimate.paymentStatus ===
        "paid";


      /*
      |--------------------------------------------------------------------------
      | Paid estimate
      |--------------------------------------------------------------------------
      */

      if (isPaid) {
        return res.json({
          success: true,
          paid: true,
          estimate,
        });
      }


      /*
      |--------------------------------------------------------------------------
      | Locked estimate
      |--------------------------------------------------------------------------
      */

      return res.json({
        success: true,

        paid: false,

        estimate: {
          _id:
            estimate._id,

          fullName:
            estimate.fullName,

          buildingType:
            estimate.buildingType,

          bedrooms:
            estimate.bedrooms,

          area:
            estimate.area,

          paintType:
            estimate.paintType,

          finishLevel:
            estimate.finishLevel,

          location:
            estimate.location,

          extras:
            estimate.extras,

          paymentStatus:
            estimate.paymentStatus,

          estimateStatus:
            estimate.estimateStatus,

          unlockFee:
            PAINTING_ESTIMATE_UNLOCK_FEE,

          currency:
            "NGN",
        },
      });
    } catch (error) {
      console.error(
        "Get painting estimate error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load painting estimate.",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| GET APPROVED PAINTERS FOR PAID ESTIMATE
|--------------------------------------------------------------------------
|
| IMPORTANT:
| - Only approved painters
| - Only active painters
| - Only painters serving the selected state
| - No fallback to other states
| - No painter phone/email exposed
|--------------------------------------------------------------------------
*/

export const getPaintingEstimatePainters =
  async (
    req,
    res,
  ) => {
    try {
      const estimate =
        await PaintingEstimate.findById(
          req.params.id,
        ).select(
          "paymentStatus location",
        );


      if (!estimate) {
        return res.status(404).json({
          success: false,
          message:
            "Painting estimate not found.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | Painters are available only after payment
      |--------------------------------------------------------------------------
      */

      if (
        estimate.paymentStatus !==
        "paid"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Please unlock the estimate first.",
        });
      }


      const stateRegex =
        getPainterStateRegex(
          estimate.location,
        );


      /*
      |--------------------------------------------------------------------------
      | Find approved active painters
      |--------------------------------------------------------------------------
      */

      const painters =
        await PainterProfile.find({
          state: {
            $regex: stateRegex,
          },

          approvalStatus:
            "approved",

          status:
            "active",
        })
          .populate({
            path: "user",
            select:
              "firstName lastName",
          })
          .sort({
            isFeatured: -1,
            averageRating: -1,
            completedJobs: -1,
            approvedAt: -1,
          });


      /*
      |--------------------------------------------------------------------------
      | Format safe public painter information
      |--------------------------------------------------------------------------
      */

      const formattedPainters =
        painters.map(
          (painter) => ({
            id:
              painter._id.toString(),

            name:
              painter.user
                ? `${painter.user.firstName || ""} ${
                    painter.user.lastName || ""
                  }`.trim()
                : "Approved Painter",

            image:
              painter.profileImage?.url ||
              "",

            description:
              painter.bio || "",

            experience:
              `${painter.yearsOfExperience || 0}+ years`,

            yearsOfExperience:
              painter.yearsOfExperience || 0,

            state:
              painter.state,

            city:
              painter.city,

            location:
              painter.city
                ? `${painter.city}, ${painter.state}`
                : painter.state,

            rating:
              Number(
                Number(
                  painter.averageRating || 0,
                ).toFixed(1),
              ),

            totalReviews:
              painter.totalReviews || 0,

            completedJobs:
              painter.completedJobs || 0,

            availabilityStatus:
              painter.availabilityStatus ||
              "offline",

            isFeatured:
              Boolean(
                painter.isFeatured,
              ),

            isVerified:
              Boolean(
                painter.isVerified,
              ),

            profileImage:
              painter.profileImage?.url ||
              "",

            portfolioImages:
              painter.portfolioImages ||
              [],
          }),
        );


      return res.json({
        success: true,

        state:
          estimate.location,

        count:
          formattedPainters.length,

        painters:
          formattedPainters,
      });
    } catch (error) {
      console.error(
        "Get painting estimate painters error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load approved painters.",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| ADMIN - GET PAINTING ESTIMATES
|--------------------------------------------------------------------------
|
| This endpoint is kept because your existing dashboard work will use it
| later. We are NOT connecting it to the dashboard yet.
|--------------------------------------------------------------------------
*/

export const getAdminPaintingEstimates =
  async (
    req,
    res,
  ) => {
    try {
      const page =
        Math.max(
          Number(
            req.query.page,
          ) || 1,
          1,
        );


      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit,
            ) || 20,
            1,
          ),
          100,
        );


      const skip =
        (page - 1) * limit;


      const filter = {};


      if (req.query.status) {
        filter.paymentStatus =
          req.query.status;
      }


      if (req.query.state) {
        filter.location =
          req.query.state;
      }


      const [
        estimates,
        total,
      ] =
        await Promise.all([
          PaintingEstimate.find(
            filter,
          )
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

          PaintingEstimate.countDocuments(
            filter,
          ),
        ]);


      return res.json({
        success: true,

        estimates,

        pagination: {
          page,
          limit,
          total,

          pages:
            Math.ceil(
              total / limit,
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get admin painting estimates error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load painting estimates.",
      });
    }
  };