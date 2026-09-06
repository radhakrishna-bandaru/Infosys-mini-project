const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const app = express();
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
app.use(
  cors({
    origin: "https://smartframerr.vercel.app",
  })
);

app.options("*", cors());

app.use(express.json());

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
app.use("/api/auth", authRoutes);
app.use(
  "/api/crops",
  protect,
  authorize("farmer", "buyer", "admin"),
  cropRoutes
);
app.use(
  "/api/markets",
  protect,
  authorize("farmer", "buyer", "admin"),
  marketRoutes
);
app.use(
  "/api/profit",
  protect,
  authorize("farmer", "admin"),
  profitRoutes
);
app.use(
  "/api/storage",
  protect,
  authorize("farmer", "storage", "admin"),
  storageRoutes
);
app.use(
  "/api/bookings",
  protect,
  authorize("farmer", "storage", "admin"),
  bookingRoutes
);
app.use(
  "/api/requirements",
  protect,
  authorize("farmer", "buyer", "admin"),
  requirementRoutes
);
app.use(
  "/api/orders",
  protect,
  authorize("farmer", "buyer", "admin"),
  orderRoutes
);
app.use(
  "/api/inventory",
  protect,
  authorize("storage", "admin"),
  inventoryRoutes
);
app.use(
  "/api/users",
  protect,
  authorize("admin"),
  userRoutes
);
app.use(
  "/api/notifications",
  protect,
  authorize("farmer", "storage", "buyer", "admin"),
  notificationRoutes
);
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚜 Smart Farmer Backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;