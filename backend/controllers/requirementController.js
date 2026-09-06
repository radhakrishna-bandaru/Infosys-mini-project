const fs = require("fs");
const path = require("path");
const notificationController = require("./notificationController");
const requirementsFile = path.join(
  __dirname,
  "../data/requirements.json"
);

function readRequirements() {
  if (!fs.existsSync(requirementsFile)) {
    fs.writeFileSync(requirementsFile, "[]");
  }

  return JSON.parse(
    fs.readFileSync(requirementsFile, "utf-8")
  );
}

function saveRequirements(requirements) {
  fs.writeFileSync(
    requirementsFile,
    JSON.stringify(requirements, null, 2)
  );
}

exports.getRequirements = (req, res) => {
  try {
    const requirements = readRequirements();
    const { buyerId } = req.query;

    let result = requirements;

    if (buyerId) {
      result = result.filter(
        (item) => item.buyerId === buyerId
      );
    }

    res.json({
      success: true,
      requirements: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch requirements",
    });
  }
};

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
    } = req.body;

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

    const requirements = readRequirements();

    const requirement = {
      id: `REQ-${Date.now()}`,
      buyerId,
      buyerName: buyerName || "",
      cropName,
      quantity: Number(quantity),
      targetPrice: Number(targetPrice) || 0,
      location: location || "",
      requiredBy: requiredBy || "",
      quality: quality || "Standard",
      notes: notes || "",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    requirements.push(requirement);
    saveRequirements(requirements);
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
    status: () => ({ json: () => {} }),
  }
);
    res.status(201).json({
      success: true,
      message: "Requirement created successfully",
      requirement,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create requirement",
    });
  }
};

exports.updateRequirement = (req, res) => {
  try {
    const { id } = req.params;

    const requirements = readRequirements();

    const index = requirements.findIndex(
      (item) => item.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    requirements[index] = {
      ...requirements[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    saveRequirements(requirements);

    res.json({
      success: true,
      message: "Requirement updated successfully",
      requirement: requirements[index],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update requirement",
    });
  }
};

exports.deleteRequirement = (req, res) => {
  try {
    const { id } = req.params;

    const requirements = readRequirements();

    const filtered = requirements.filter(
      (item) => item.id !== id
    );

    if (filtered.length === requirements.length) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    saveRequirements(filtered);

    res.json({
      success: true,
      message: "Requirement deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete requirement",
    });
  }
};