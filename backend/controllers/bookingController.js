const fs = require("fs");
const path = require("path");
const notificationController = require("./notificationController");
const bookingPath = path.join(
  __dirname,
  "../data/bookings.json"
);

const storagePath = path.join(
  __dirname,
  "../data/storages.json"
);

function readBookings() {
  try {
    return JSON.parse(
      fs.readFileSync(bookingPath, "utf-8")
    );
  } catch {
    return [];
  }
}

function writeBookings(data) {
  fs.writeFileSync(
    bookingPath,
    JSON.stringify(data, null, 2)
  );
}

function readStorages() {
  try {
    return JSON.parse(
      fs.readFileSync(storagePath, "utf-8")
    );
  } catch {
    return [];
  }
}

function writeStorages(data) {
  fs.writeFileSync(
    storagePath,
    JSON.stringify(data, null, 2)
  );
}

// GET BOOKINGS
exports.getBookings = (req, res) => {
  const {
    farmerId,
    storageId,
    status,
  } = req.query;

  let bookings = readBookings();

  if (farmerId) {
    bookings = bookings.filter(
      (booking) =>
        String(booking.farmerId) === String(farmerId)
    );
  }

  if (storageId) {
    bookings = bookings.filter(
      (booking) =>
        String(booking.storageId) === String(storageId)
    );
  }

  if (status && status !== "all") {
    bookings = bookings.filter(
      (booking) =>
        booking.status === status
    );
  }

  res.json({
    success: true,
    bookings,
  });
};

// CREATE BOOKING
exports.createBooking = (req, res) => {
  const {
    farmerId,
    farmerName,
    storageId,
    storageName,
    cropName,
    quantity,
    unit,
    storageDays,
    startDate,
    endDate,
    estimatedCost,
    notes,
  } = req.body;

  if (
    !farmerId ||
    !storageId ||
    !cropName ||
    !quantity
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Farmer, storage, crop and quantity are required",
    });
  }

  const quantityNumber = Number(quantity);

  if (
    !Number.isFinite(quantityNumber) ||
    quantityNumber <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be greater than 0",
    });
  }

  const storages = readStorages();

  const storage = storages.find(
    (item) =>
      String(item.id) === String(storageId)
  );

  if (!storage) {
    return res.status(404).json({
      success: false,
      message: "Storage not found",
    });
  }

  if (!storage.active) {
    return res.status(400).json({
      success: false,
      message: "This storage is currently inactive",
    });
  }

  if (
    Number(storage.availableCapacity || 0) <
    quantityNumber
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Not enough storage capacity available",
    });
  }

  const bookings = readBookings();

  const booking = {
    id: `BOOK-${Date.now()}`,

    farmerId,
    farmerName: farmerName || "Farmer",

    storageId,
    storageName:
      storageName || storage.name || "",

    cropName,

    quantity: quantityNumber,
    unit: unit || "kg",

    storageDays:
      Number(storageDays) || 1,

    startDate: startDate || "",
    endDate: endDate || "",

    estimatedCost:
      Number(estimatedCost) || 0,

    notes: notes || "",

    status: "pending",

    createdAt:
      new Date().toISOString(),
  };

  bookings.push(booking);

  writeBookings(bookings);
  notificationController.createNotification(
  {
    body: {
      userId: farmerId,
      title: "Storage Booking Sent",
      message: `Your ${cropName} booking request for ${quantityNumber} kg has been sent successfully.`,
      type: "info",
    },
  },
  {
    status: () => ({
      json: () => {},
    }),
  }
);

  res.status(201).json({
    success: true,
    message:
      "Storage booking request created successfully",
    booking,
  });
};

// UPDATE BOOKING STATUS
exports.updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "declined",
    "cancelled",
    "completed",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking status",
    });
  }

  const bookings = readBookings();

  const index = bookings.findIndex(
    (booking) =>
      String(booking.id) === String(id)
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  const booking = bookings[index];

  // CONFIRM BOOKING
  if (
    status === "confirmed" &&
    booking.status !== "confirmed"
  ) {
    const storages = readStorages();

    const storageIndex = storages.findIndex(
      (storage) =>
        String(storage.id) ===
        String(booking.storageId)
    );

    if (storageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    const availableCapacity = Number(
      storages[storageIndex].availableCapacity || 0
    );

    const bookingQuantity = Number(
      booking.quantity || 0
    );

    if (
      availableCapacity <
      bookingQuantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough storage capacity available",
      });
    }

    // Reduce available capacity
    storages[storageIndex].availableCapacity =
      availableCapacity -
      bookingQuantity;

    storages[storageIndex].updatedAt =
      new Date().toISOString();

    writeStorages(storages);
  }

  // CANCEL / DECLINE AFTER CONFIRMATION
  // Return capacity back to storage
  if (
    (status === "cancelled" ||
      status === "declined") &&
    booking.status === "confirmed"
  ) {
    const storages = readStorages();

    const storageIndex = storages.findIndex(
      (storage) =>
        String(storage.id) ===
        String(booking.storageId)
    );

    if (storageIndex !== -1) {
      const currentCapacity = Number(
        storages[storageIndex].availableCapacity || 0
      );

      const totalCapacity = Number(
        storages[storageIndex].capacity || 0
      );

      const restoredCapacity = Math.min(
        totalCapacity,
        currentCapacity +
          Number(booking.quantity || 0)
      );

      storages[storageIndex].availableCapacity =
        restoredCapacity;

      storages[storageIndex].updatedAt =
        new Date().toISOString();

      writeStorages(storages);
    }
  }

  bookings[index] = {
    ...booking,

    status,

    updatedAt:
      new Date().toISOString(),
  };

  writeBookings(bookings);
  if (status === "confirmed") {
  notificationController.createNotification(
    {
      body: {
        userId: booking.farmerId,
        title: "Storage Booking Confirmed",
        message: `Your ${booking.cropName} booking at ${booking.storageName} has been confirmed.`,
        type: "success",
      },
    },
    {
      status: () => ({
        json: () => {},
      }),
    }
  );
}

if (status === "declined") {
  notificationController.createNotification(
    {
      body: {
        userId: booking.farmerId,
        title: "Storage Booking Declined",
        message: `Your ${booking.cropName} booking at ${booking.storageName} was declined.`,
        type: "warning",
      },
    },
    {
      status: () => ({
        json: () => {},
      }),
    }
  );
}

  res.json({
    success: true,
    message:
      "Booking status updated successfully",
    booking: bookings[index],
  });
};