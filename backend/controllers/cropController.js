const fs = require("fs");
const path = require("path");

const cropsFile = path.join(__dirname, "../data/crops.json");

function readCrops() {
  try {
  if (!fs.existsSync(cropsFile)) {
    fs.writeFileSync(cropsFile, "[]","utf8");
  }

  const data = fs.readFileSync(cropsFile, "utf8");
    return data ? JSON.parse(data) : [];
}catch (error) {
    console.error("Read crops error:", error);
    return [];
  }
}
function writeCrops(crops) {
  fs.writeFileSync(
    cropsFile,
    JSON.stringify(crops, null, 2),
    "utf8"
  );
}

function saveCrops(crops) {
  fs.writeFileSync(
    cropsFile,
    JSON.stringify(crops, null, 2)
  );
}

exports.getCrops = (req, res) => {
  try {
    const crops = readCrops();

    res.json({
      success: true,
      crops,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};

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

    if (
      !farmerId ||
      !cropName ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Farmer, crop name and quantity are required",
      });
    }

    const crops = readCrops();

    const crop = {
      id: `CROP-${Date.now()}`,
      farmerId,
      farmerName: farmerName || "Farmer",
      cropName,
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

    writeCrops(crops);

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

exports.updateCrop = (req, res) => {
  try {
    const { id } = req.params;

    const crops = readCrops();

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

    writeCrops(crops);

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

exports.deleteCrop = (req, res) => {
  try {
    const { id } = req.params;

    const crops = readCrops();

    const filteredCrops = crops.filter(
      (crop) => crop.id !== id
    );

    if (filteredCrops.length === crops.length) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    saveCrops(filteredCrops);

    res.json({
      success: true,
      message: "Crop deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete crop",
    });
  }
};