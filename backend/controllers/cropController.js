const fs = require("fs");
const path = require("path");

const cropsFile = path.join(__dirname, "../data/crops.json");

// Vercel filesystem is read-only.
// JSON file is used only as initial seed data.
// New/updated/deleted crops live in runtime memory.
let runtimeCrops = null;

function loadInitialCrops() {
  try {
    if (!fs.existsSync(cropsFile)) {
      return [];
    }

    const data = fs.readFileSync(cropsFile, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Read crops error:", error);
    return [];
  }
}

function getCropsData() {
  if (runtimeCrops === null) {
    runtimeCrops = loadInitialCrops();
  }

  return runtimeCrops;
}

// ==================== GET CROPS ====================

exports.getCrops = (req, res) => {
  try {
    const crops = getCropsData();

    res.json({
      success: true,
      crops,
    });
  } catch (error) {
    console.error("Get crops error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};

// ==================== CREATE CROP ====================

exports.createCrop = (req, res) => {
  try {
    const {
      farmerId,
      farmerName,
      cropName,
      variety,
      quantity,
      unit,
      expectedPrice,
      harvestDate,
      location,
    } = req.body;

    if (!farmerId || !cropName || !quantity) {
      return res.status(400).json({
        success: false,
        message:
          "Farmer, crop name and quantity are required",
      });
    }

    const crops = getCropsData();

    const crop = {
      id: `CROP-${Date.now()}`,
      farmerId,
      farmerName: farmerName || "Farmer",
      cropName: String(cropName).trim(),
      variety: variety || "",
      quantity: Number(quantity),
      unit: unit || "kg",
      expectedPrice: Number(expectedPrice || 0),
      harvestDate: harvestDate || "",
      location: location || "",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    crops.unshift(crop);

    // IMPORTANT:
    // Do NOT write to crops.json on Vercel.
    runtimeCrops = crops;

    res.status(201).json({
      success: true,
      message: "Crop created successfully",
      crop,
    });
  } catch (error) {
    console.error("Create crop error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create crop",
    });
  }
};

// ==================== UPDATE CROP ====================

exports.updateCrop = (req, res) => {
  try {
    const { id } = req.params;

    const crops = getCropsData();

    const index = crops.findIndex(
      (crop) => crop.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const currentCrop = crops[index];

    const {
      farmerId,
      farmerName,
      cropName,
      variety,
      quantity,
      unit,
      expectedPrice,
      harvestDate,
      location,
      status,
    } = req.body;

    crops[index] = {
      ...currentCrop,

      farmerId:
        farmerId || currentCrop.farmerId,

      farmerName:
        farmerName ||
        currentCrop.farmerName ||
        "Farmer",

      cropName:
        cropName || currentCrop.cropName,

      variety:
        variety ?? currentCrop.variety,

      quantity:
        quantity !== undefined
          ? Number(quantity)
          : currentCrop.quantity,

      unit:
        unit || currentCrop.unit,

      expectedPrice:
        expectedPrice !== undefined
          ? Number(expectedPrice)
          : currentCrop.expectedPrice,

      harvestDate:
        harvestDate ?? currentCrop.harvestDate,

      location:
        location ?? currentCrop.location,

      status:
        status || currentCrop.status,

      updatedAt: new Date().toISOString(),
    };

    runtimeCrops = crops;

    res.json({
      success: true,
      message: "Crop updated successfully",
      crop: crops[index],
    });
  } catch (error) {
    console.error("Update crop error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update crop",
    });
  }
};

// ==================== DELETE CROP ====================

exports.deleteCrop = (req, res) => {
  try {
    const { id } = req.params;

    const crops = getCropsData();

    const index = crops.findIndex(
      (crop) => crop.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const deletedCrop = crops[index];

    crops.splice(index, 1);

    runtimeCrops = crops;

    res.json({
      success: true,
      message: "Crop deleted successfully",
      crop: deletedCrop,
    });
  } catch (error) {
    console.error("Delete crop error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete crop",
    });
  }
};