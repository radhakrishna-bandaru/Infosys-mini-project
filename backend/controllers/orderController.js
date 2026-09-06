const fs = require("fs");
const path = require("path");
const notificationController = require("./notificationController");
const filePath = path.join(
  __dirname,
  "../data/orders.json"
);

function readOrders() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(orders, null, 2)
  );
}

// GET /api/orders
exports.getOrders = (req, res) => {
  try {
    let orders = readOrders();

    const { buyerId, farmerId } = req.query;

    if (buyerId) {
      orders = orders.filter(
        (order) => order.buyerId === buyerId
      );
    }

    if (farmerId) {
      orders = orders.filter(
        (order) => order.farmerId === farmerId
      );
    }

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load orders",
    });
  }
};

// POST /api/orders
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
    } = req.body;

   if (
  !buyerId ||
  !cropName ||
  !quantity ||
  !price ||
  !Number.isFinite(Number(quantity)) ||
  Number(quantity) <= 0 ||
  !Number.isFinite(Number(price)) ||
  Number(price) <= 0
) {
      return res.status(400).json({
        success: false,
        message:
          "Buyer, crop, quantity and price are required",
      });
    }

    const orders = readOrders();

    const order = {
      id: `ORD-${Date.now()}`,
      buyerId,
      buyerName: buyerName || "",
      farmerId: farmerId || "",
      farmerName: farmerName || "",
      cropName,
      quantity: Number(quantity),
      price: Number(price),
      totalAmount:
        Number(quantity) * Number(price),
      location: location || "",
      deliveryDate: deliveryDate || "",
      notes: notes || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

   orders.unshift(order);

writeOrders(orders);

// Notify buyer
notificationController.createNotification(
  {
    body: {
      userId: buyerId,
      title: "Order Placed",
      message: `Your order for ${cropName} has been placed successfully.`,
      type: "success",
    },
  },
  {
    status: () => ({ json: () => {} }),
  }
);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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
      (order) => order.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    orders[index].status = status;
    orders[index].updatedAt =
      new Date().toISOString();

    writeOrders(orders);
    // Notify farmer about order status
if (orders[index].farmerId) {
  notificationController.createNotification(
    {
      body: {
        userId: orders[index].farmerId,
        title: "Order Status Updated",
        message: `Your ${orders[index].cropName} order is now ${status}.`,
        type: status === "confirmed" ? "success" : "info",
      },
    },
    {
      status: () => ({ json: () => {} }),
    }
  );
}

    res.json({
      success: true,
      message: "Order status updated",
      order: orders[index],
    });

  } catch (error) {
    console.error("Update order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update order",
    });
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = (req, res) => {
  try {
    const { id } = req.params;

    const orders = readOrders();

    const filtered = orders.filter(
      (order) => order.id !== id
    );

    if (filtered.length === orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    writeOrders(filtered);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete order",
    });
  }
};