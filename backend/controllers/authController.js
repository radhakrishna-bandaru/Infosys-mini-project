const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const usersFile = path.join(__dirname, "../data/users.json");

function readUsers() {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]");
  }

  return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(
    usersFile,
    JSON.stringify(users, null, 2)
  );
}

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
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
        message: "Email or phone is required",
      });
    }

    const users = readUsers();

    const existingUser = users.find(
      (user) =>
        (email && user.email === email) ||
        (phone && user.phone === phone)
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email: email || "",
      phone: phone || "",
      password: hashedPassword,
      role,
      active: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      active: newUser.active,
    };

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const {
      email,
      phone,
      password,
      role,
    } = req.body;

    if (!password || !role || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Login details are required",
      });
    }

    const users = readUsers();

    const user = users.find(
      (item) =>
        item.role === role &&
        ((email && item.email === email) ||
          (phone && item.phone === phone))
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};