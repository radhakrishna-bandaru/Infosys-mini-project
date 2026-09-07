const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const usersFile = path.join(__dirname, "../data/users.json");

function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.mkdirSync(path.dirname(usersFile), { recursive: true });
      fs.writeFileSync(usersFile, "[]");
    }

    const data = fs.readFileSync(usersFile, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Read users error:", error);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(
    usersFile,
    JSON.stringify(users, null, 2),
    "utf8"
  );
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email || "",
      phone: user.phone || "",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      location,
      farmName,
      businessName,
    } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, password and role are required",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    const allowedRoles = [
      "farmer",
      "storage",
      "buyer",
      "admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const users = readUsers();

    const normalizedEmail = email
      ? email.trim().toLowerCase()
      : "";

    const normalizedPhone = phone
      ? phone.trim()
      : "";

    const existingUser = users.find((user) => {
      const sameEmail =
        normalizedEmail &&
        user.email &&
        user.email.toLowerCase() === normalizedEmail;

      const samePhone =
        normalizedPhone &&
        user.phone &&
        user.phone === normalizedPhone;

      return sameEmail || samePhone;
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email or phone already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: `${role}-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: passwordHash,
      role,
      location: location ? location.trim() : "",
      farmName: farmName ? farmName.trim() : "",
      businessName: businessName
        ? businessName.trim()
        : "",
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    const token = createToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      farmName: user.farmName,
      businessName: user.businessName,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      phone,
      password,
      role,
    } = req.body;

    if (!password || !role) {
      return res.status(400).json({
        success: false,
        message: "Password and role are required",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    const users = readUsers();

    const identifier = email
      ? email.trim().toLowerCase()
      : phone.trim();

    const user = users.find((item) => {
      const emailMatch =
        email &&
        item.email &&
        item.email.toLowerCase() === identifier;

      const phoneMatch =
        phone &&
        item.phone &&
        item.phone === identifier;

      return (
        (emailMatch || phoneMatch) &&
        item.role === role
      );
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email/phone, password or role",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email/phone, password or role",
      });
    }

    const token = createToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location || "",
      farmName: user.farmName || "",
      businessName: user.businessName || "",
      createdAt: user.createdAt,
    };

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

module.exports = router;