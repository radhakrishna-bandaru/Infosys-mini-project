const express = require("express");

const {
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} = require("../controllers/requirementController");

const router = express.Router();

router.get("/", getRequirements);
router.post("/", createRequirement);
router.put("/:id", updateRequirement);
router.delete("/:id", deleteRequirement);

module.exports = router;