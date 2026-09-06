const express = require("express");

const {
  getCrops,
  createCrop,
  updateCrop,
  deleteCrop,
} = require("../controllers/cropController");

const router = express.Router();

router.get("/", getCrops);
router.post("/", createCrop);
router.put("/:id", updateCrop);
router.delete("/:id", deleteCrop);

module.exports = router;