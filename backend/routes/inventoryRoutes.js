const express = require("express");

const {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

const router = express.Router();

router.get("/", getInventory);
router.post("/", createInventory);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;