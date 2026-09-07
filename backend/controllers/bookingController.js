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

// Vercel filesystem is read-only.
// JSON files are used only as initial seed data.
let runtimeBookings = null;
let runtimeStorages = null;

function loadBookings() {
  try {
    if (!fs.existsSync(bookingPath)) return [];

    const data = fs.readFileSync(
      bookingPath,
      "utf-8"
    );

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Read bookings error:", error);
    return [];
  }
}

function loadStorages() {
  try {
    if (!fs.existsSync(storagePath)) return [];

    const data = fs.readFileSync(
      storagePath,
      "utf-8"
    );

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Read storages error:", error);
    return [];
  }
}

function getBookingsData() {
  if (runtimeBookings === null) {
    runtimeBookings = loadBookings();
  }

  return runtimeBookings;
}

function getStoragesData() {
  if (runtimeStorages === null) {
    runtimeStorages = loadStorages();
  }

  return runtimeStorages;
}

// ==================== GET BOOKINGS ====================

exports.getBookings = (req, res) => {
  try {
    const {
      farmerId,
      storageId,
      status,
    } = req.query;

    let bookings = [...getBookingsData()];

    if (farmerId) {
      bookings = bookings.filter(
        (booking) =>
          String(booking.farmerId) ===
          String(farmerId)
      );
    }

    if (storageId) {
      bookings = bookings.filter(
        (booking) =>
          String(booking.storageId) ===
          String(storageId)
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
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ==================== CREATE BOOKING ====================

exports.createBooking = (req, res) => {
  try {
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
        message:
          "Quantity must be greater than 0",
      });
    }

    const storages = getStoragesData();

    const storage = storages.find(
      (item) =>
        String(item.id) ===
        String(storageId)
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
        message:
          "This storage is currently inactive",
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

    const bookings = getBookingsData();

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

    // Store in runtime memory instead of JSON file.
    runtimeBookings = bookings;

    // Notification
    try {
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
    } catch (notificationError) {
      console.error(
        "Booking notification error:",
        notificationError
      );
    }

    res.status(201).json({
      success: true,
      message:
        "Storage booking request created successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to create storage booking",
    });
  }
};

// ==================== UPDATE BOOKING STATUS ====================

exports.updateBookingStatus = (req, res) => {
  try {
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

    const bookings = getBookingsData();

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

    // ==================== CONFIRM ====================

    if (
      status === "confirmed" &&
      booking.status !== "confirmed"
    ) {
      const storages = getStoragesData();

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
        storages[storageIndex]
          .availableCapacity || 0
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

      storages[storageIndex]
        .availableCapacity =
        availableCapacity -
        bookingQuantity;

      storages[storageIndex].updatedAt =
        new Date().toISOString();

      // Runtime only — no filesystem write.
      runtimeStorages = storages;
    }

    // ==================== CANCEL / DECLINE ====================

    if (
      (status === "cancelled" ||
        status === "declined") &&
      booking.status === "confirmed"
    ) {
      const storages = getStoragesData();

      const storageIndex = storages.findIndex(
        (storage) =>
          String(storage.id) ===
          String(booking.storageId)
      );

      if (storageIndex !== -1) {
        const currentCapacity = Number(
          storages[storageIndex]
            .availableCapacity || 0
        );

        const totalCapacity = Number(
          storages[storageIndex].capacity || 0
        );

        const restoredCapacity = Math.min(
          totalCapacity,
          currentCapacity +
            Number(booking.quantity || 0)
        );

        storages[storageIndex]
          .availableCapacity =
          restoredCapacity;

        storages[storageIndex].updatedAt =
          new Date().toISOString();

        runtimeStorages = storages;
      }
    }

    bookings[index] = {
      ...booking,
      status,
      updatedAt:
        new Date().toISOString(),
    };

    // Runtime only — no filesystem write.
    runtimeBookings = bookings;

    // ==================== NOTIFICATIONS ====================

    try {
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
    } catch (notificationError) {
      console.error(
        "Status notification error:",
        notificationError
      );
    }

    res.json({
      success: true,
      message:
        "Booking status updated successfully",
      booking: bookings[index],
    });
  } catch (error) {
    console.error(
      "Update booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to update booking status",
    });
  }
};