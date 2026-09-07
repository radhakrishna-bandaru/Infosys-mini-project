const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/inventory.json"
);

// Vercel filesystem is read-only.
// JSON file is used only as initial seed data.
let runtimeInventory = null;

function loadInventory() {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const data = fs.readFileSync(
      filePath,
      "utf-8"
    );

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(
      "Read inventory error:",
      error
    );

    return [];
  }
}

function getInventoryData() {
  if (runtimeInventory === null) {
    runtimeInventory = loadInventory();
  }

  return runtimeInventory;
}

// ==================== GET INVENTORY ====================

exports.getInventory = (req, res) => {
  try {
    const { storageId } = req.query;

    let inventory = [
      ...getInventoryData(),
    ];

    if (storageId) {
      inventory = inventory.filter(
        (item) =>
          String(item.storageId) ===
          String(storageId)
      );
    }

    res.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error(
      "Get inventory error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

// ==================== CREATE INVENTORY ====================

exports.createInventory = (req, res) => {
  try {
    const {
      storageId,
      storageName,
      cropName,
      quantity,
      unit,
      temperature,
      entryDate,
      expectedExitDate,
    } = req.body;

    if (
      !storageId ||
      !cropName ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Storage, crop name and quantity are required",
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

    const inventory = getInventoryData();

    const item = {
      id: `INV-${Date.now()}`,

      storageId,

      storageName:
        storageName || "",

      cropName,

      quantity: quantityNumber,

      unit: unit || "kg",

      temperature:
        temperature || "",

      entryDate:
        entryDate || "",

      expectedExitDate:
        expectedExitDate || "",

      status: "stored",

      createdAt:
        new Date().toISOString(),
    };

    inventory.push(item);

    // Runtime memory only.
    // No writeFileSync because Vercel filesystem is read-only.
    runtimeInventory = inventory;

    res.status(201).json({
      success: true,
      message:
        "Inventory added successfully",
      inventory: item,
    });
  } catch (error) {
    console.error(
      "Create inventory error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to create inventory",
    });
  }
};

// ==================== UPDATE INVENTORY ====================

exports.updateInventory = (req, res) => {
  try {
    const { id } = req.params;

    const inventory = getInventoryData();

    const index = inventory.findIndex(
      (item) =>
        String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory item not found",
      });
    }

    const currentItem = inventory[index];

    inventory[index] = {
      ...currentItem,
      ...req.body,

      quantity:
        req.body.quantity !== undefined
          ? Number(req.body.quantity)
          : currentItem.quantity,

      updatedAt:
        new Date().toISOString(),
    };

    runtimeInventory = inventory;

    res.json({
      success: true,
      message:
        "Inventory updated successfully",
      inventory: inventory[index],
    });
  } catch (error) {
    console.error(
      "Update inventory error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to update inventory",
    });
  }
};

// ==================== DELETE INVENTORY ====================

exports.deleteInventory = (req, res) => {
  try {
    const { id } = req.params;

    const inventory = getInventoryData();

    const filtered = inventory.filter(
      (item) =>
        String(item.id) !== String(id)
    );

    if (
      filtered.length ===
      inventory.length
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory item not found",
      });
    }

    runtimeInventory = filtered;

    res.json({
      success: true,
      message:
        "Inventory deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete inventory error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to delete inventory",
    });
  }
};