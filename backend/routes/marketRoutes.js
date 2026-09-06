const express = require("express");

const {
  getMarkets,
  getMarketById,
} = require("../controllers/marketController");

const router = express.Router();

router.get("/", getMarkets);
router.get("/:id", getMarketById);

module.exports = router;