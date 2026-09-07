const fs = require("fs");
const path = require("path");
const notificationController = require("./notificationController");

const requirementsFile = path.join(
  __dirname,
  "../data/requirements.json"
);

// =====================================================
// JSON FILE IS ONLY SEED DATA
// VERCEL FILESYSTEM IS READ-ONLY
// =====================================================

function readRequirements() {
  try {
    if (!fs.existsSync(requirementsFile)) {
      return [];
    }

    const data = fs.readFileSync(
      requirementsFile,
      "utf-8"
    );

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(
      "Requirements seed read error:",
      error
    );

    return [];
  }
}

// Keep data in server memory.
// DO NOT write to requirements.json on Vercel.
let runtimeRequirements = readRequirements();

// =====================================================
// GET REQUIREMENTS
// =====================================================

exports.getRequirements = (req, res) => {
  try {
    const { buyerId } = req.query;

    let result = runtimeRequirements;

    if (buyerId) {
      result = result.filter(
        (item) =>
          String(item.buyerId) === String(buyerId)
      );
    }

    res.json({
      success: true,
      requirements: result,
    });
  } catch (error) {
    console.error(
      "Get requirements error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch requirements",
    });
  }
};

// =====================================================
// CREATE REQUIREMENT
// =====================================================

exports.createRequirement = (req, res) => {
  try {
    const {
      buyerId,
      buyerName,
      cropName,
      quantity,
      targetPrice,
      location,
      requiredBy,
      quality,
      notes,
    } = req.body || {};

    // Validation
    if (
      !buyerId ||
      !cropName ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Buyer, crop and quantity are required",
      });
    }

    const requirement = {
      id: `REQ-${Date.now()}`,

      buyerId: String(buyerId),

      buyerName:
        buyerName || "",

      cropName:
        String(cropName).trim(),

      quantity:
        Number(quantity),

      targetPrice:
        Number(targetPrice) || 0,

      location:
        location || "",

      requiredBy:
        requiredBy || "",

      quality:
        quality || "Standard",

      notes:
        notes || "",

      status: "active",

      createdAt:
        new Date().toISOString(),
    };

    // IMPORTANT:
    // Store in runtime memory instead of filesystem.
    runtimeRequirements.push(requirement);

    // Notification should never break requirement creation.
    try {
      notificationController.createNotification(
        {
          body: {
            userId: buyerId,
            title: "Requirement Posted",
            message: `Your requirement for ${cropName} has been posted successfully.`,
            type: "success",
          },
        },
        {
          status: () => ({
            json: () => {},
          }),
        }
      );
    } catch (notificationError) {
      console.warn(
        "Requirement notification failed:",
        notificationError
      );
    }

    res.status(201).json({
      success: true,
      message:
        "Requirement created successfully",
      requirement,
    });
  } catch (error) {
    console.error(
      "Create requirement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create requirement",
    });
  }
};

// =====================================================
// UPDATE REQUIREMENT
// =====================================================

exports.updateRequirement = (req, res) => {
  try {
    const { id } = req.params;

    const index =
      runtimeRequirements.findIndex(
        (item) =>
          String(item.id) === String(id)
      );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message:
          "Requirement not found",
      });
    }

    runtimeRequirements[index] = {
      ...runtimeRequirements[index],
      ...req.body,
      id: runtimeRequirements[index].id,
      updatedAt:
        new Date().toISOString(),
    };

    res.json({
      success: true,
      message:
        "Requirement updated successfully",
      requirement:
        runtimeRequirements[index],
    });
  } catch (error) {
    console.error(
      "Update requirement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update requirement",
    });
  }
};

// =====================================================
// DELETE REQUIREMENT
// =====================================================

exports.deleteRequirement = (req, res) => {
  try {
    const { id } = req.params;

    const existing =
      runtimeRequirements.find(
        (item) =>
          String(item.id) === String(id)
      );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message:
          "Requirement not found",
      });
    }

    runtimeRequirements =
      runtimeRequirements.filter(
        (item) =>
          String(item.id) !== String(id)
      );

    res.json({
      success: true,
      message:
        "Requirement deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete requirement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete requirement",
    });
  }
};