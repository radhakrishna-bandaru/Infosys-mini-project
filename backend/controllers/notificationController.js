const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/notifications.json"
);

function readNotifications() {
  try {
    return JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );
  } catch {
    return [];
  }
}

function writeNotifications(data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}

// GET
exports.getNotifications = (req, res) => {
  const { userId } = req.query;

  let notifications = readNotifications();

  if (userId) {
    notifications = notifications.filter(
      (item) =>
        String(item.userId) === String(userId)
    );
  }

  notifications.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  res.json({
    success: true,
    notifications,
  });
};

// CREATE
exports.createNotification = (req, res) => {
  const {
    userId,
    title,
    message,
    type,
  } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({
      success: false,
      message:
        "User, title and message are required",
    });
  }

  const notifications = readNotifications();

  const notification = {
    id: `NOT-${Date.now()}`,
    userId,
    title,
    message,
    type: type || "info",
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.push(notification);

  writeNotifications(notifications);

  res.status(201).json({
    success: true,
    message: "Notification created",
    notification,
  });
};

// MARK AS READ
exports.markNotificationRead = (req, res) => {
  const { id } = req.params;

  const notifications = readNotifications();

  const index = notifications.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  notifications[index].read = true;

  writeNotifications(notifications);

  res.json({
    success: true,
    message: "Notification marked as read",
    notification: notifications[index],
  });
};

// DELETE
exports.deleteNotification = (req, res) => {
  const { id } = req.params;

  const notifications = readNotifications();

  const filtered = notifications.filter(
    (item) => item.id !== id
  );

  if (filtered.length === notifications.length) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  writeNotifications(filtered);

  res.json({
    success: true,
    message: "Notification deleted",
  });
};