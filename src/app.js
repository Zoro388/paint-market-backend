
import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import painterRequestRoutes from "./routes/painterRequest.routes.js";
import siteEstimatorRoutes from "./routes/siteEstimator.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import toolRoutes from "./routes/tool.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import siteSettingsRoutes from "./routes/siteSettings.routes.js";
import masterDataRoutes from "./routes/masterData.routes.js";
import painterRoutes from "./routes/painter.routes.js";



import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";


const app = express();

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://paintdomain.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(helmet());

app.use(compression());

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Logger
|--------------------------------------------------------------------------
*/

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Paint Market API Running 🚀",
  });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use(
  "/api/products",
  productRoutes
);
app.use(
  "/api/orders",
  orderRoutes
);
app.use(
  "/api/payments",
  paymentRoutes
);
app.use(
  "/api/leads",
  leadRoutes
);
app.use(
  "/api/newsletter",
  newsletterRoutes
);
app.use(
  "/api/painter-requests",
  painterRequestRoutes
);

app.use(
  "/api/site-estimator",
  siteEstimatorRoutes
);

app.use(
  "/api/portfolio",
  portfolioRoutes
);

app.use(
  "/api/blogs",
  blogRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);


app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/tools",
  toolRoutes
);


app.use(
  "/api/media",
  mediaRoutes
);

app.use(
  "/api/settings",
  siteSettingsRoutes
);

app.use(
  "/api/master-data",
  masterDataRoutes
);

app.use("/api/painters", painterRoutes);
/*
|--------------------------------------------------------------------------
| Error Handling
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;