const fs = require("fs");
const path = require("path");
const filePath = path.join(
  __dirname,
  "../data/users.json"
);
function readUsers() {
  try {
    return JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );
  } catch {
    return [];
  }
}
function writeUsers(data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}
exports.getUsers = (req, res) => {
  const { role, search } = req.query;
  let users = readUsers();
  if (role && role !== "all") {
    users = users.filter(
      (user) => user.role === role
    );
  }
  if (search) {
    const text = search.toLowerCase();
    users = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text) ||
        user.phone?.includes(search)
    );
  }
  const safeUsers = users.map(
    ({ password, ...user }) => user
  );
  res.json({
    success: true,
    users: safeUsers,
  });
};
exports.updateUserStatus = (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  const users = readUsers();

  const index = users.findIndex(
    (user) =>
      String(user.id) === String(id)
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  users[index].active = Boolean(active);

  users[index].updatedAt =
    new Date().toISOString();

  writeUsers(users);

  const { password, ...safeUser } =
    users[index];

  res.json({
    success: true,
    message: "User status updated",
    user: safeUser,
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const users = readUsers();

  const filtered = users.filter(
    (user) =>
      String(user.id) !== String(id)
  );

  if (filtered.length === users.length) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  writeUsers(filtered);

  res.json({
    success: true,
    message: "User deleted successfully",
  });
};