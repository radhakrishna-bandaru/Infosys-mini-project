const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/users.json"
);

// JSON file is only used as initial seed.
// Never write to filesystem on Vercel.
function readUsers() {
  try {
    const data = fs.readFileSync(
      filePath,
      "utf-8"
    );

    const parsed = JSON.parse(data);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Users seed loading error:",
      error
    );

    return [];
  }
}

// Runtime memory.
// No fs.writeFileSync().
let runtimeUsers = readUsers();


// ==================== GET USERS ====================

exports.getUsers = (req, res) => {
  try {
    const {
      role,
      search,
    } = req.query;

    let users = [...runtimeUsers];

    if (
      role &&
      role !== "all"
    ) {
      users = users.filter(
        (user) =>
          user.role === role
      );
    }

    if (search) {
      const text =
        String(search)
          .toLowerCase()
          .trim();

      users = users.filter(
        (user) =>
          String(
            user.name || ""
          )
            .toLowerCase()
            .includes(text) ||

          String(
            user.email || ""
          )
            .toLowerCase()
            .includes(text) ||

          String(
            user.phone || ""
          ).includes(search)
      );
    }

    // Never expose passwords.
    const safeUsers =
      users.map(
        ({
          password,
          ...user
        }) => user
      );

    return res.json({
      success: true,
      users: safeUsers,
    });
  } catch (error) {
    console.error(
      "GET users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load users",
    });
  }
};


// ==================== UPDATE USER STATUS ====================

exports.updateUserStatus = (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const { active } =
      req.body;

    const index =
      runtimeUsers.findIndex(
        (user) =>
          String(user.id) ===
          String(id)
      );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    runtimeUsers[index] = {
      ...runtimeUsers[index],

      active:
        Boolean(active),

      updatedAt:
        new Date().toISOString(),
    };

    const {
      password,
      ...safeUser
    } = runtimeUsers[index];

    return res.json({
      success: true,
      message:
        "User status updated",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "UPDATE user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user status",
    });
  }
};


// ==================== DELETE USER ====================

exports.deleteUser = (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const index =
      runtimeUsers.findIndex(
        (user) =>
          String(user.id) ===
          String(id)
      );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    runtimeUsers.splice(
      index,
      1
    );

    return res.json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete user",
    });
  }
};