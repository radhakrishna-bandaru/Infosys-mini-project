const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/storages.json"
);

// Read JSON only as initial seed.
// DO NOT write to filesystem on Vercel.
function readStorages() {
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
      "Storage seed loading error:",
      error
    );

    return [];
  }
}

// Runtime memory storage.
// Vercel-safe: no fs.writeFileSync().
let runtimeStorages = readStorages();


// ==================== GET ALL STORAGES ====================

exports.getStorages = (req, res) => {
  try {
    const {
      crop,
      location,
      verified,
    } = req.query;

    let storages = [...runtimeStorages];

    if (crop) {
      storages = storages.filter(
        (storage) =>
          Array.isArray(storage.crops) &&
          storage.crops.some(
            (item) =>
              String(item).toLowerCase() ===
              String(crop).toLowerCase()
          )
      );
    }

    if (location) {
      storages = storages.filter(
        (storage) =>
          String(storage.location || "")
            .toLowerCase()
            .includes(
              String(location).toLowerCase()
            )
      );
    }

    if (verified === "true") {
      storages = storages.filter(
        (storage) =>
          storage.verified === true
      );
    }

    return res.json({
      success: true,
      storages,
    });
  } catch (error) {
    console.error(
      "GET storages error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load storages",
    });
  }
};


// ==================== GET SINGLE STORAGE ====================

exports.getStorageById = (req, res) => {
  try {
    const { id } = req.params;

    const storage = runtimeStorages.find(
      (item) =>
        String(item.id) === String(id)
    );

    if (!storage) {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    return res.json({
      success: true,
      storage,
    });
  } catch (error) {
    console.error(
      "GET storage error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load storage",
    });
  }
};


// ==================== CREATE STORAGE ====================

exports.createStorage = (req, res) => {
  try {
    const {
      name,
      owner,
      location,
      latitude,
      longitude,
      capacity,
      availableCapacity,
      rentPerKgPerDay,
      temperature,
      storageType,
      verified,
      crops,
    } = req.body;

    if (
      !name ||
      !owner ||
      !location ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, owner, location and capacity are required",
      });
    }

    const storage = {
      id: `storage-${Date.now()}`,

      name: String(name).trim(),

      owner: String(owner).trim(),

      location: String(location).trim(),

      latitude: Number(latitude || 0),

      longitude: Number(longitude || 0),

      capacity: Number(capacity),

      availableCapacity: Number(
        availableCapacity ?? capacity
      ),

      rentPerKgPerDay: Number(
        rentPerKgPerDay || 0
      ),

      temperature:
        temperature || "",

      storageType:
        storageType ||
        "Cold Storage",

      verified:
        Boolean(verified),

      active: true,

      crops: Array.isArray(crops)
        ? crops
        : [],

      createdAt:
        new Date().toISOString(),
    };

    runtimeStorages.push(storage);

    return res.status(201).json({
      success: true,
      message:
        "Storage created successfully",
      storage,
    });
  } catch (error) {
    console.error(
      "CREATE storage error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create storage",
    });
  }
};


// ==================== UPDATE STORAGE ====================

exports.updateStorage = (req, res) => {
  try {
    const { id } = req.params;

    const index =
      runtimeStorages.findIndex(
        (storage) =>
          String(storage.id) ===
          String(id)
      );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    const existing =
      runtimeStorages[index];

    runtimeStorages[index] = {
      ...existing,
      ...req.body,

      id: existing.id,

      latitude:
        req.body.latitude !== undefined
          ? Number(req.body.latitude)
          : existing.latitude,

      longitude:
        req.body.longitude !== undefined
          ? Number(req.body.longitude)
          : existing.longitude,

      capacity:
        req.body.capacity !== undefined
          ? Number(req.body.capacity)
          : existing.capacity,

      availableCapacity:
        req.body.availableCapacity !==
        undefined
          ? Number(
              req.body.availableCapacity
            )
          : existing.availableCapacity,

      rentPerKgPerDay:
        req.body.rentPerKgPerDay !==
        undefined
          ? Number(
              req.body.rentPerKgPerDay
            )
          : existing.rentPerKgPerDay,

      updatedAt:
        new Date().toISOString(),
    };

    return res.json({
      success: true,
      message:
        "Storage updated successfully",
      storage:
        runtimeStorages[index],
    });
  } catch (error) {
    console.error(
      "UPDATE storage error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update storage",
    });
  }
};


// ==================== DELETE STORAGE ====================

exports.deleteStorage = (req, res) => {
  try {
    const { id } = req.params;

    const index =
      runtimeStorages.findIndex(
        (storage) =>
          String(storage.id) ===
          String(id)
      );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    runtimeStorages.splice(index, 1);

    return res.json({
      success: true,
      message:
        "Storage deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE storage error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete storage",
    });
  }
};


// ==================== ACTIVATE / DEACTIVATE ====================

exports.updateStorageStatus = (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const index =
      runtimeStorages.findIndex(
        (storage) =>
          String(storage.id) ===
          String(id)
      );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    runtimeStorages[index].active =
      Boolean(active);

    runtimeStorages[index].updatedAt =
      new Date().toISOString();

    return res.json({
      success: true,
      message:
        "Storage status updated",
      storage:
        runtimeStorages[index],
    });
  } catch (error) {
    console.error(
      "UPDATE storage status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update storage status",
    });
  }
};


// ==================== VERIFY / UNVERIFY ====================

exports.updateStorageVerification = (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const index =
      runtimeStorages.findIndex(
        (storage) =>
          String(storage.id) ===
          String(id)
      );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    runtimeStorages[index].verified =
      Boolean(verified);

    runtimeStorages[index].updatedAt =
      new Date().toISOString();

    return res.json({
      success: true,
      message:
        "Storage verification updated",
      storage:
        runtimeStorages[index],
    });
  } catch (error) {
    console.error(
      "UPDATE storage verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update storage verification",
    });
  }
};