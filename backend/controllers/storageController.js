const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/storages.json"
);

function readStorages() {
  try {
    return JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );
  } catch {
    return [];
  }
}

function writeStorages(data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}

// GET ALL STORAGES
exports.getStorages = (req, res) => {
  const { crop, location, verified } = req.query;

  let storages = readStorages();

  if (crop) {
    storages = storages.filter((storage) =>
      storage.crops?.some(
        (item) =>
          item.toLowerCase() === crop.toLowerCase()
      )
    );
  }

  if (location) {
    storages = storages.filter((storage) =>
      storage.location
        ?.toLowerCase()
        .includes(location.toLowerCase())
    );
  }

  if (verified === "true") {
    storages = storages.filter(
      (storage) => storage.verified === true
    );
  }

  res.json({
    success: true,
    storages,
  });
};

// GET SINGLE STORAGE
exports.getStorageById = (req, res) => {
  const { id } = req.params;

  const storages = readStorages();

  const storage = storages.find(
    (item) => item.id === id
  );

  if (!storage) {
    return res.status(404).json({
      success: false,
      message: "Storage not found",
    });
  }

  res.json({
    success: true,
    storage,
  });
};

// CREATE STORAGE
exports.createStorage = (req, res) => {
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

  if (!name || !owner || !location || !capacity) {
    return res.status(400).json({
      success: false,
      message:
        "Name, owner, location and capacity are required",
    });
  }

  const storages = readStorages();

  const storage = {
    id: `storage-${Date.now()}`,
    name,
    owner,
    location,
    latitude: Number(latitude || 0),
    longitude: Number(longitude || 0),
    capacity: Number(capacity),
    availableCapacity: Number(
      availableCapacity ?? capacity
    ),
    rentPerKgPerDay: Number(
      rentPerKgPerDay || 0
    ),
    temperature: temperature || "",
    storageType:
      storageType || "Cold Storage",
    verified: Boolean(verified),
    active: true,
    crops: Array.isArray(crops) ? crops : [],
    createdAt: new Date().toISOString(),
  };

  storages.push(storage);
  writeStorages(storages);

  res.status(201).json({
    success: true,
    message: "Storage created successfully",
    storage,
  });
};

// UPDATE STORAGE
exports.updateStorage = (req, res) => {
  const { id } = req.params;

  const storages = readStorages();

  const index = storages.findIndex(
    (storage) => storage.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Storage not found",
    });
  }

  const existing = storages[index];

  storages[index] = {
    ...existing,
    ...req.body,

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
      req.body.availableCapacity !== undefined
        ? Number(req.body.availableCapacity)
        : existing.availableCapacity,

    rentPerKgPerDay:
      req.body.rentPerKgPerDay !== undefined
        ? Number(req.body.rentPerKgPerDay)
        : existing.rentPerKgPerDay,

    updatedAt: new Date().toISOString(),
  };

  writeStorages(storages);

  res.json({
    success: true,
    message: "Storage updated successfully",
    storage: storages[index],
  });
};

// DELETE STORAGE
exports.deleteStorage = (req, res) => {
  const { id } = req.params;

  const storages = readStorages();

  const filtered = storages.filter(
    (storage) => storage.id !== id
  );

  if (filtered.length === storages.length) {
    return res.status(404).json({
      success: false,
      message: "Storage not found",
    });
  }

  writeStorages(filtered);

  res.json({
    success: true,
    message: "Storage deleted successfully",
  });
};

// ACTIVATE / DEACTIVATE STORAGE
exports.updateStorageStatus = (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  const storages = readStorages();

  const index = storages.findIndex(
    (storage) => storage.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Storage not found",
    });
  }

  storages[index].active = Boolean(active);
  storages[index].updatedAt =
    new Date().toISOString();

  writeStorages(storages);

  res.json({
    success: true,
    message: "Storage status updated",
    storage: storages[index],
  });
};

// VERIFY / UNVERIFY STORAGE
exports.updateStorageVerification = (
  req,
  res
) => {
  const { id } = req.params;
  const { verified } = req.body;

  const storages = readStorages();

  const index = storages.findIndex(
    (storage) => storage.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Storage not found",
    });
  }

  storages[index].verified =
    Boolean(verified);

  storages[index].updatedAt =
    new Date().toISOString();

  writeStorages(storages);

  res.json({
    success: true,
    message:
      "Storage verification updated",
    storage: storages[index],
  });
};