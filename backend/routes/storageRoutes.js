const express = require("express");

const {
  getStorages,
  getStorageById,
  createStorage,
  updateStorage,
  deleteStorage,
  updateStorageStatus,
  updateStorageVerification,
} = require("../controllers/storageController");

const router = express.Router();

router.get("/", getStorages);

router.get("/:id", getStorageById);

router.post("/", createStorage);

router.put("/:id", updateStorage);

router.delete("/:id", deleteStorage);

router.patch("/:id/status", updateStorageStatus);

router.patch(
  "/:id/verification",
  updateStorageVerification
);

module.exports = router;