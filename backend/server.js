const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const cropRoutes = require("./routes/cropRoutes");
const storageRoutes = require("./routes/storageRoutes");
const profitRoutes = require("./routes/profitRoutes");
const marketRoutes = require("./routes/marketRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const {
  protect,
  authorize,
} = require("./middleware/authMiddleware");

const app = express();

/* =========================
   CORS
========================= */

const cors = require("cors");

app.use(
  cors({
    origin: "https://smartfarmerr.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://smartframerr.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});
/* =========================
   BODY PARSER
========================= */

app.use(express.json());

/* =========================
   HEALTH ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Farmer Backend is running 🚜",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart Farmer API is healthy",
  });
});

/* =========================
   AUTH
========================= */

app.use("/api/auth", authRoutes);

/* =========================
   CROP ROUTES
========================= */

app.use(
  "/api/crops",
  protect,
  authorize("farmer", "buyer", "admin"),
  cropRoutes
);

/* =========================
   MARKET ROUTES
========================= */

app.use(
  "/api/markets",
  protect,
  authorize("farmer", "buyer", "admin"),
  marketRoutes
);

/* =========================
   PROFIT ROUTES
========================= */

app.use(
  "/api/profit",
  protect,
  authorize("farmer", "admin"),
  profitRoutes
);

/* =========================
   STORAGE ROUTES
========================= */

app.use(
  "/api/storage",
  protect,
  authorize("farmer", "storage", "admin"),
  storageRoutes
);

/* =========================
   BOOKING ROUTES
========================= */

app.use(
  "/api/bookings",
  protect,
  authorize("farmer", "storage", "admin"),
  bookingRoutes
);

/* =========================
   REQUIREMENT ROUTES
========================= */

app.use(
  "/api/requirements",
  protect,
  authorize("farmer", "buyer", "admin"),
  requirementRoutes
);

/* =========================
   ORDER ROUTES
========================= */

app.use(
  "/api/orders",
  protect,
  authorize("farmer", "buyer", "admin"),
  orderRoutes
);

/* =========================
   INVENTORY ROUTES
========================= */

app.use(
  "/api/inventory",
  protect,
  authorize("storage", "admin"),
  inventoryRoutes
);

/* =========================
   USER ROUTES
========================= */

app.use(
  "/api/users",
  protect,
  authorize("admin"),
  userRoutes
);

/* =========================
   NOTIFICATION ROUTES
========================= */

app.use(
  "/api/notifications",
  protect,
  authorize("farmer", "storage", "buyer", "admin"),
  notificationRoutes
);

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🚜 Smart Farmer Backend running on port ${PORT}`
    );
  });
}

module.exports = app;