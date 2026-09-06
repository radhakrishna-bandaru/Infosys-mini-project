const express = require("express");

const {
  calculateProfit,
  recommendProfit,
} = require("../controllers/profitController");

const router = express.Router();

router.post("/calculate", calculateProfit);
router.post("/recommend", recommendProfit);

module.exports = router;