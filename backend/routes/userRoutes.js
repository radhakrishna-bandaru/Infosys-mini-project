const express = require("express");

const {
  getUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

module.exports = router;