const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/inventory.json"
);

function readInventory() {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function writeInventory(data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}

exports.getInventory = (req, res) => {
  const { storageId } = req.query;

  let inventory = readInventory();

  if (storageId) {
    inventory = inventory.filter(
      (item) => item.storageId === storageId
    );
  }

  res.json({
    success: true,
    inventory,
  });
};

exports.createInventory = (req, res) => {
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

  if (!storageId || !cropName || !quantity) {
    return res.status(400).json({
      success: false,
      message: "Storage, crop name and quantity are required",
    });
  }

  const inventory = readInventory();

  const item = {
    id: `INV-${Date.now()}`,
    storageId,
    storageName: storageName || "",
    cropName,
    quantity: Number(quantity),
    unit: unit || "kg",
    temperature: temperature || "",
    entryDate: entryDate || "",
    expectedExitDate: expectedExitDate || "",
    status: "stored",
    createdAt: new Date().toISOString(),
  };

  inventory.push(item);
  writeInventory(inventory);

  res.status(201).json({
    success: true,
    message: "Inventory added successfully",
    inventory: item,
  });
};

exports.updateInventory = (req, res) => {
  const { id } = req.params;

  const inventory = readInventory();

  const index = inventory.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Inventory item not found",
    });
  }

  inventory[index] = {
    ...inventory[index],
    ...req.body,
    quantity:
      req.body.quantity !== undefined
        ? Number(req.body.quantity)
        : inventory[index].quantity,
    updatedAt: new Date().toISOString(),
  };

  writeInventory(inventory);

  res.json({
    success: true,
    message: "Inventory updated successfully",
    inventory: inventory[index],
  });
};

exports.deleteInventory = (req, res) => {
  const { id } = req.params;

  const inventory = readInventory();

  const filtered = inventory.filter(
    (item) => item.id !== id
  );

  if (filtered.length === inventory.length) {
    return res.status(404).json({
      success: false,
      message: "Inventory item not found",
    });
  }

  writeInventory(filtered);

  res.json({
    success: true,
    message: "Inventory deleted successfully",
  });
};