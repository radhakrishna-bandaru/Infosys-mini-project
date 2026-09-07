const fs = require("fs");
const path = require("path");
const notificationController = require("./notificationController");

const filePath = path.join(
  __dirname,
  "../data/orders.json"
);

// =====================================================
// LOAD JSON DATA AS SEED ONLY
// Vercel filesystem is read-only, so DO NOT write here.
// =====================================================

let runtimeOrders = null;

function readOrders() {
  if (runtimeOrders !== null) {
    return runtimeOrders;
  }

  try {
    const data = fs.readFileSync(filePath, "utf-8");

    const parsed = JSON.parse(data || "[]");

    runtimeOrders = Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error("Read orders error:", error);
    runtimeOrders = [];
  }

  return runtimeOrders;
}

// =====================================================
// NOTIFICATION HELPER
// Notification failure should NEVER break an order.
// =====================================================

function sendNotification({
  userId,
  title,
  message,
  type = "info",
}) {
  if (!userId) return;

  try {
    notificationController.createNotification(
      {
        body: {
          userId,
          title,
          message,
          type,
        },
      },
      {
        status: () => ({
          json: () => {},
        }),
      }
    );
  } catch (error) {
    console.error(
      "Order notification error:",
      error
    );
  }
}

// =====================================================
// GET /api/orders
// =====================================================

exports.getOrders = (req, res) => {
  try {
    let orders = readOrders();

    const { buyerId, farmerId } = req.query;

    if (buyerId) {
      orders = orders.filter(
        (order) =>
          String(order.buyerId) === String(buyerId)
      );
    }

    if (farmerId) {
      orders = orders.filter(
        (order) =>
          String(order.farmerId) === String(farmerId)
      );
    }

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load orders",
    });
  }
};

// =====================================================
// POST /api/orders
// =====================================================

exports.createOrder = (req, res) => {
  try {
    const {
      buyerId,
      buyerName,
      farmerId,
      farmerName,
      cropName,
      quantity,
      price,
      location,
      deliveryDate,
      notes,
    } = req.body || {};

    const numericQuantity = Number(quantity);
    const numericPrice = Number(price);

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!buyerId) {
      return res.status(400).json({
        success: false,
        message: "Buyer is required",
      });
    }

    if (!cropName || !String(cropName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required",
      });
    }

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid quantity",
      });
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid price",
      });
    }

    // -----------------------------
    // CREATE ORDER IN MEMORY
    // -----------------------------

    const orders = readOrders();

    const order = {
      id: `ORD-${Date.now()}`,

      buyerId: String(buyerId),
      buyerName: buyerName || "",

      farmerId: farmerId
        ? String(farmerId)
        : "",

      farmerName: farmerName || "",

      cropName: String(cropName).trim(),

      quantity: numericQuantity,
      price: numericPrice,

      totalAmount:
        numericQuantity * numericPrice,

      location: location || "",
      deliveryDate: deliveryDate || "",
      notes: notes || "",

      status: "pending",

      createdAt:
        new Date().toISOString(),
    };

    // Add to runtime memory
    orders.unshift(order);

    // IMPORTANT:
    // DO NOT call fs.writeFileSync here.
    // Vercel filesystem is read-only.

    // -----------------------------
    // NOTIFY BUYER
    // -----------------------------

    sendNotification({
      userId: buyerId,
      title: "Order Placed",
      message: `Your order for ${order.cropName} has been placed successfully.`,
      type: "success",
    });

    // -----------------------------
    // NOTIFY FARMER
    // -----------------------------

    if (farmerId) {
      sendNotification({
        userId: farmerId,
        title: "New Order Received",
        message: `A new order for ${order.cropName} has been received.`,
        type: "info",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create order",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// PATCH /api/orders/:id/status
// =====================================================

exports.updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "completed",
      "cancelled",
      "declined",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const orders = readOrders();

    const index = orders.findIndex(
      (order) =>
        String(order.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    orders[index] = {
      ...orders[index],

      status,

      updatedAt:
        new Date().toISOString(),
    };

    const updatedOrder = orders[index];

    // -----------------------------
    // NOTIFY FARMER
    // -----------------------------

    if (updatedOrder.farmerId) {
      sendNotification({
        userId: updatedOrder.farmerId,

        title: "Order Status Updated",

        message: `Your ${updatedOrder.cropName} order is now ${status}.`,

        type:
          status === "confirmed"
            ? "success"
            : "info",
      });
    }

    // -----------------------------
    // NOTIFY BUYER
    // -----------------------------

    if (updatedOrder.buyerId) {
      sendNotification({
        userId: updatedOrder.buyerId,

        title: "Order Status Updated",

        message: `Your ${updatedOrder.cropName} order is now ${status}.`,

        type:
          status === "completed"
            ? "success"
            : "info",
      });
    }

    return res.json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update order",
    });
  }
};

// =====================================================
// DELETE /api/orders/:id
// =====================================================

exports.deleteOrder = (req, res) => {
  try {
    const { id } = req.params;

    const orders = readOrders();

    const index = orders.findIndex(
      (order) =>
        String(order.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    orders.splice(index, 1);

    // IMPORTANT:
    // No fs.writeFileSync here.

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete order",
    });
  }
};