const fs = require("fs");
const path = require("path");

const marketsFile = path.join(
  __dirname,
  "../data/markets.json"
);

function readMarkets() {
  if (!fs.existsSync(marketsFile)) {
    fs.writeFileSync(marketsFile, "[]");
  }

  return JSON.parse(
    fs.readFileSync(marketsFile, "utf-8")
  );
}

exports.getMarkets = (req, res) => {
  try {
    const markets = readMarkets();

    const {
      crop,
      location,
    } = req.query;

    let result = markets;

    if (crop) {
      result = result.filter(
        (market) =>
          market.crop.toLowerCase() ===
          crop.toLowerCase()
      );
    }

    if (location) {
      result = result.filter(
        (market) =>
          market.location.toLowerCase() ===
          location.toLowerCase()
      );
    }

    res.json({
      success: true,
      markets: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch market data",
    });
  }
};

exports.getMarketById = (req, res) => {
  try {
    const markets = readMarkets();

    const market = markets.find(
      (item) => item.id === req.params.id
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }

    res.json({
      success: true,
      market,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch market",
    });
  }
};