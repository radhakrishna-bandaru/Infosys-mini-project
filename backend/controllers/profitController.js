exports.calculateProfit = (req, res) => {
  try {
    const {
      quantity,
      currentPrice,
      futurePrice,
      storageRate,
      storageDays,
      transportCost,
      spoilageRate,
    } = req.body;

    if (
      !quantity ||
      currentPrice === undefined ||
      futurePrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity, current price and future price are required",
      });
    }

    const qty = Number(quantity);
    const nowPrice = Number(currentPrice);
    const laterPrice = Number(futurePrice);

    const rate = Number(storageRate) || 0;
    const days = Number(storageDays) || 0;
    const transport = Number(transportCost) || 0;
    const spoilage = Number(spoilageRate) || 0;

    // Sell now
    const sellNowRevenue = qty * nowPrice;
    const sellNowNet = sellNowRevenue - transport;

    // Store and sell later
    const storageCost = qty * rate * days;
    const spoiledQuantity =
      qty * (spoilage / 100);

    const sellableQuantity =
      Math.max(qty - spoiledQuantity, 0);

    const futureRevenue =
      sellableQuantity * laterPrice;

    const storeAndSellNet =
      futureRevenue -
      storageCost -
      transport;

    const difference =
      storeAndSellNet - sellNowNet;

    const recommendation =
      difference > 0
        ? "STORE_AND_SELL"
        : "SELL_NOW";

    const futurePriceIncrease =
      nowPrice > 0
        ? ((laterPrice - nowPrice) / nowPrice) * 100
        : 0;

    res.json({
      success: true,

      result: {
        sellNow: {
          revenue: Number(
            sellNowRevenue.toFixed(2)
          ),
          netProfit: Number(
            sellNowNet.toFixed(2)
          ),
        },

        storeAndSell: {
          futureRevenue: Number(
            futureRevenue.toFixed(2)
          ),
          storageCost: Number(
            storageCost.toFixed(2)
          ),
          spoilageLossQuantity: Number(
            spoiledQuantity.toFixed(2)
          ),
          sellableQuantity: Number(
            sellableQuantity.toFixed(2)
          ),
          netProfit: Number(
            storeAndSellNet.toFixed(2)
          ),
        },

        difference: Number(
          difference.toFixed(2)
        ),

        futurePriceIncrease: Number(
          futurePriceIncrease.toFixed(2)
        ),

        recommendation,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Profit calculation failed",
    });
  }
  
};
exports.recommendProfit = (req, res) => {
  try {
    const {
      quantity,
      currentPrice,
      futurePrice,
      storageRate,
      storageDays,
      transportCost,
      spoilageRate,
    } = req.body;

    if (!quantity || currentPrice === undefined || futurePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity, current price and future price are required",
      });
    }

    const qty = Number(quantity);
    const nowPrice = Number(currentPrice);
    const laterPrice = Number(futurePrice);
    const rate = Number(storageRate) || 0;
    const days = Number(storageDays) || 0;
    const transport = Number(transportCost) || 0;
    const spoilage = Number(spoilageRate) || 0;

    const sellNowNet =
      qty * nowPrice - transport;

    const spoiledQuantity =
      qty * (spoilage / 100);

    const sellableQuantity =
      Math.max(qty - spoiledQuantity, 0);

    const storageCost =
      qty * rate * days;

    const futureRevenue =
      sellableQuantity * laterPrice;

    const storeAndSellNet =
      futureRevenue - storageCost - transport;

    const difference =
      storeAndSellNet - sellNowNet;

    const recommendation =
      difference > 0
        ? "STORE_AND_SELL"
        : "SELL_NOW";

    res.json({
      success: true,
      recommendation,
      difference: Number(difference.toFixed(2)),
      sellNowNet: Number(sellNowNet.toFixed(2)),
      storeAndSellNet: Number(storeAndSellNet.toFixed(2)),
      storageCost: Number(storageCost.toFixed(2)),
      sellableQuantity: Number(sellableQuantity.toFixed(2)),
    });
  } catch (error) {
    console.error("Profit recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Profit recommendation failed",
    });
  }
};