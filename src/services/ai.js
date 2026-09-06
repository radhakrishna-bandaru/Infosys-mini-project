import {
  getCrops,
  getMarkets,
  getStorages,
  getOrders,
  getBookings,
} from "./api";

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[?!.,]/g, "")
    .trim();
}

function findCrop(text, crops) {
  const cropNames = [
    ...new Set(
      crops
        .map((crop) => crop.cropName)
        .filter(Boolean)
    ),
  ];

  return cropNames.find((crop) =>
    text.includes(crop.toLowerCase())
  );
}

function detectLanguage(text = "") {
  const teluguPattern =
    /[\u0C00-\u0C7F]/;

  const hindiPattern =
    /[\u0900-\u097F]/;

  if (teluguPattern.test(text)) {
    return "te";
  }

  if (hindiPattern.test(text)) {
    return "hi";
  }

  return "en";
}

export async function askSmartFarmer(
  question,
  farmerId
) {
  const text = normalize(question);
  const language = detectLanguage(
    question
  );

  if (!text) {
    return getMessage(
      language,
      "empty"
    );
  }

  try {
    const [
      cropsResponse,
      marketsResponse,
      storagesResponse,
      ordersResponse,
      bookingsResponse,
    ] = await Promise.all([
      getCrops(),
      getMarkets(),
      getStorages(),
      farmerId
        ? getOrders({ farmerId })
        : Promise.resolve({
            orders: [],
          }),
      farmerId
        ? getBookings({ farmerId })
        : Promise.resolve({
            bookings: [],
          }),
    ]);

    const crops =
      cropsResponse.crops || [];

    const markets =
      marketsResponse.markets || [];

    const storages =
      storagesResponse.storages || [];

    const orders =
      ordersResponse.orders || [];

    const bookings =
      bookingsResponse.bookings || [];

    const cropName = findCrop(
      text,
      crops
    );

    // MARKET
    if (
      text.includes("price") ||
      text.includes("market") ||
      text.includes("rate") ||
      text.includes("ధర") ||
      text.includes("మార్కెట్") ||
      text.includes("రేటు") ||
      text.includes("भाव") ||
      text.includes("बाजार") ||
      text.includes("कीमत")
    ) {
      const relevantMarkets =
        cropName
          ? markets.filter(
              (market) =>
                market.crop?.toLowerCase() ===
                cropName.toLowerCase()
            )
          : markets;

      if (!relevantMarkets.length) {
        return getMessage(
          language,
          "noMarket",
          cropName
        );
      }

      const bestMarket =
        [...relevantMarkets].sort(
          (a, b) =>
            Number(b.price || 0) -
            Number(a.price || 0)
        )[0];

      return marketMessage(
        language,
        bestMarket,
        cropName
      );
    }

    // STORAGE
    if (
      text.includes("storage") ||
      text.includes("cold") ||
      text.includes("store") ||
      text.includes("warehouse") ||
      text.includes("గోడౌన్") ||
      text.includes("స్టోరేజ్") ||
      text.includes("చల్లని") ||
      text.includes("भंडारण") ||
      text.includes("कोल्ड") ||
      text.includes("गोदाम")
    ) {
      const relevantStorages =
        cropName
          ? storages.filter(
              (storage) =>
                storage.crops?.some(
                  (crop) =>
                    crop.toLowerCase() ===
                    cropName.toLowerCase()
                )
            )
          : storages;

      const activeStorages =
        relevantStorages.filter(
          (storage) =>
            storage.active !== false &&
            Number(
              storage.availableCapacity || 0
            ) > 0
        );

      if (!activeStorages.length) {
        return getMessage(
          language,
          "noStorage",
          cropName
        );
      }

      const nearest =
        [...activeStorages].sort(
          (a, b) =>
            Number(a.distance || 999) -
            Number(b.distance || 999)
        )[0];

      return storageMessage(
        language,
        nearest,
        cropName
      );
    }

    // MY CROPS
    if (
      text.includes("my crop") ||
      text.includes("my crops") ||
      text.includes("crop list") ||
      text.includes("what crops") ||
      text.includes("నా పంట") ||
      text.includes("నా పంటలు") ||
      text.includes("నా క్రాప్స్") ||
      text.includes("मेरी फसल") ||
      text.includes("मेरी फसलें")
    ) {
      const farmerCrops = farmerId
        ? crops.filter(
            (crop) =>
              String(crop.farmerId) ===
              String(farmerId)
          )
        : crops;

      if (!farmerCrops.length) {
        return getMessage(
          language,
          "noCrops"
        );
      }

      return cropListMessage(
        language,
        farmerCrops
      );
    }

    // ORDERS
    if (
      text.includes("order") ||
      text.includes("orders") ||
      text.includes("ఆర్డర్") ||
      text.includes("ఆర్డర్లు") ||
      text.includes("ऑर्डर") ||
      text.includes("ऑर्डर्स")
    ) {
      if (!orders.length) {
        return getMessage(
          language,
          "noOrders"
        );
      }

      const pending =
        orders.filter(
          (order) =>
            order.status === "pending"
        ).length;

      const completed =
        orders.filter(
          (order) =>
            order.status === "completed"
        ).length;

      return orderMessage(
        language,
        orders.length,
        pending,
        completed
      );
    }

    // BOOKINGS
    if (
      text.includes("booking") ||
      text.includes("bookings") ||
      text.includes("బుకింగ్") ||
      text.includes("బుకింగ్స్") ||
      text.includes("बुकिंग") ||
      text.includes("बुकिंग्स")
    ) {
      if (!bookings.length) {
        return getMessage(
          language,
          "noBookings"
        );
      }

      const pending =
        bookings.filter(
          (booking) =>
            booking.status === "pending"
        ).length;

      const confirmed =
        bookings.filter(
          (booking) =>
            booking.status === "confirmed"
        ).length;

      return bookingMessage(
        language,
        bookings.length,
        pending,
        confirmed
      );
    }

    // HELP
    if (
      text.includes("help") ||
      text.includes("what can you do") ||
      text.includes("features") ||
      text.includes("సహాయం") ||
      text.includes("ఏం చేయగలవు") ||
      text.includes("मदद") ||
      text.includes("क्या कर सकते हो")
    ) {
      return getMessage(
        language,
        "help"
      );
    }

    // GREETING
    if (
      text === "hi" ||
      text === "hello" ||
      text === "hey" ||
      text.includes("namaste") ||
      text.includes("నమస్తే") ||
      text.includes("హాయ్") ||
      text.includes("नमस्ते")
    ) {
      return getMessage(
        language,
        "greeting"
      );
    }

    return getMessage(
      language,
      "fallback"
    );
  } catch (error) {
    console.error(
      "Smart Farmer AI error:",
      error
    );

    return getMessage(
      language,
      "error"
    );
  }
}

function marketMessage(
  language,
  market,
  cropName
) {
  if (language === "te") {
    return cropName
      ? `${cropName} కి ప్రస్తుతం మా డేటాలో అత్యధిక ధర ₹${market.price} per ${market.unit || "kg"}. ఈ ధర ${market.name}, ${market.location} లో ఉంది.`
      : `ప్రస్తుతం అత్యధిక మార్కెట్ ధర ₹${market.price} per ${market.unit || "kg"} ${market.name} లో ఉంది.`;
  }

  if (language === "hi") {
    return cropName
      ? `${cropName} के लिए अभी उपलब्ध डेटा में सबसे अच्छी कीमत ₹${market.price} प्रति ${market.unit || "kg"} है। यह कीमत ${market.name}, ${market.location} में है।`
      : `अभी उपलब्ध बाजारों में सबसे अच्छी कीमत ₹${market.price} प्रति ${market.unit || "kg"} ${market.name} में है।`;
  }

  return cropName
    ? `For ${cropName}, the highest current price is ₹${market.price} per ${market.unit || "kg"} at ${market.name}, ${market.location}.`
    : `The highest current market price is ₹${market.price} per ${market.unit || "kg"} at ${market.name}.`;
}

function storageMessage(
  language,
  storage,
  cropName
) {
  if (language === "te") {
    return cropName
      ? `${cropName} కోసం దగ్గరలో అందుబాటులో ఉన్న cold storage ${storage.name}, ${storage.location}. ఇది సుమారు ${storage.distance || "అంచనా"} km దూరంలో ఉంది. Rent ₹${storage.rentPerKgPerDay} per kg per day.`
      : `దగ్గరలో అందుబాటులో ఉన్న cold storage ${storage.name}, ${storage.location}. ఇది సుమారు ${storage.distance || "అంచనా"} km దూరంలో ఉంది.`;
  }

  if (language === "hi") {
    return cropName
      ? `${cropName} के लिए सबसे नजदीकी उपलब्ध cold storage ${storage.name}, ${storage.location} है। यह लगभग ${storage.distance || "अनुमानित"} km दूर है। किराया ₹${storage.rentPerKgPerDay} प्रति kg प्रति दिन है।`
      : `सबसे नजदीकी उपलब्ध cold storage ${storage.name}, ${storage.location} है। यह लगभग ${storage.distance || "अनुमानित"} km दूर है।`;
  }

  return cropName
    ? `The nearest available storage for ${cropName} is ${storage.name} in ${storage.location}, about ${storage.distance || "an estimated"} km away. Rent is ₹${storage.rentPerKgPerDay} per kg per day.`
    : `The nearest available cold storage is ${storage.name} in ${storage.location}, about ${storage.distance || "an estimated"} km away.`;
}

function cropListMessage(
  language,
  crops
) {
  const summary = crops
    .slice(0, 5)
    .map(
      (crop) =>
        `${crop.cropName} (${crop.quantity} ${crop.unit || "kg"})`
    )
    .join(", ");

  if (language === "te") {
    return `మీ దగ్గర ${crops.length} crop listing${crops.length > 1 ? "లు" : ""} ఉన్నాయి. ${summary}.`;
  }

  if (language === "hi") {
    return `आपके पास कुल ${crops.length} crop listing हैं। ${summary}।`;
  }

  return `You currently have ${crops.length} crop listing${crops.length > 1 ? "s" : ""}. ${summary}.`;
}

function orderMessage(
  language,
  total,
  pending,
  completed
) {
  if (language === "te") {
    return `మీకు మొత్తం ${total} orders ఉన్నాయి. ${pending} pending మరియు ${completed} completed.`;
  }

  if (language === "hi") {
    return `आपके पास कुल ${total} orders हैं। ${pending} pending और ${completed} completed हैं।`;
  }

  return `You have ${total} orders in total. ${pending} are pending and ${completed} are completed.`;
}

function bookingMessage(
  language,
  total,
  pending,
  confirmed
) {
  if (language === "te") {
    return `మీకు మొత్తం ${total} storage bookings ఉన్నాయి. ${pending} pending మరియు ${confirmed} confirmed.`;
  }

  if (language === "hi") {
    return `आपके पास कुल ${total} storage bookings हैं। ${pending} pending और ${confirmed} confirmed हैं।`;
  }

  return `You have ${total} storage bookings. ${pending} are pending and ${confirmed} are confirmed.`;
}

function getMessage(
  language,
  type,
  cropName = ""
) {
  const messages = {
    en: {
      empty:
        "Please ask me something about your crops, markets, storage, bookings or orders.",

      greeting:
        "Hello! I am your Smart Farmer assistant. Ask me about your crops, market prices, storage, bookings or orders.",

      noMarket: cropName
        ? `I could not find current market prices for ${cropName}.`
        : "I could not find current market price data.",

      noStorage: cropName
        ? `I could not find an available cold storage for ${cropName}.`
        : "I could not find an available cold storage right now.",

      noCrops:
        "You do not have any crop listings yet. You can add your crop from My Crops.",

      noOrders:
        "You do not have any farmer orders yet.",

      noBookings:
        "You do not have any storage bookings yet.",

      help:
        "I can help you check crop prices, compare markets, find cold storage, review your crops, check bookings and orders, and guide you on selling or storing your produce.",

      fallback:
        "I can help with crops, market prices, cold storage, bookings and orders. Try asking: Which market gives the best price for tomato?",

      error:
        "I am unable to access the latest platform data right now. Please try again.",
    },

    te: {
      empty:
        "మీ పంటలు, మార్కెట్ ధరలు, స్టోరేజ్, బుకింగ్స్ లేదా ఆర్డర్ల గురించి నన్ను అడగండి.",

      greeting:
        "హాయ్! నేను మీ Smart Farmer Assistant. పంట ధరలు, మార్కెట్లు, cold storage, bookings లేదా orders గురించి అడగండి.",

      noMarket: cropName
        ? `${cropName} కి ప్రస్తుతం మార్కెట్ ధరల సమాచారం దొరకలేదు.`
        : "ప్రస్తుతం మార్కెట్ ధరల సమాచారం దొరకలేదు.",

      noStorage: cropName
        ? `${cropName} కోసం ప్రస్తుతం అందుబాటులో ఉన్న cold storage దొరకలేదు.`
        : "ప్రస్తుతం అందుబాటులో ఉన్న cold storage దొరకలేదు.",

      noCrops:
        "మీకు ఇంకా crop listings లేవు. My Crops లో మీ పంటను add చేయవచ్చు.",

      noOrders:
        "మీకు ఇంకా farmer orders లేవు.",

      noBookings:
        "మీకు ఇంకా storage bookings లేవు.",

      help:
        "నేను పంట ధరలు, మార్కెట్ comparison, cold storage, మీ crops, bookings మరియు orders గురించి సమాచారం ఇవ్వగలను.",

      fallback:
        "నేను crops, market prices, cold storage, bookings మరియు orders గురించి సహాయం చేయగలను. ఉదాహరణకు: Tomato కి ఏ market లో మంచి ధర ఉంది?",

      error:
        "ప్రస్తుతం తాజా platform data తీసుకోలేకపోతున్నాను. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
    },

    hi: {
      empty:
        "अपनी फसल, बाजार कीमत, storage, bookings या orders के बारे में पूछें।",

      greeting:
        "नमस्ते! मैं आपका Smart Farmer Assistant हूँ। फसल की कीमत, बाजार, cold storage, bookings या orders के बारे में पूछें।",

      noMarket: cropName
        ? `${cropName} के लिए अभी बाजार कीमत की जानकारी नहीं मिली।`
        : "अभी बाजार कीमत की जानकारी उपलब्ध नहीं है।",

      noStorage: cropName
        ? `${cropName} के लिए अभी कोई उपलब्ध cold storage नहीं मिला।`
        : "अभी कोई उपलब्ध cold storage नहीं मिला।",

      noCrops:
        "आपके पास अभी कोई crop listing नहीं है। आप My Crops से अपनी फसल जोड़ सकते हैं।",

      noOrders:
        "आपके पास अभी कोई farmer order नहीं है।",

      noBookings:
        "आपके पास अभी कोई storage booking नहीं है।",

      help:
        "मैं फसल की कीमत, बाजार तुलना, cold storage, आपकी crops, bookings और orders के बारे में मदद कर सकता हूँ।",

      fallback:
        "मैं crops, market prices, cold storage, bookings और orders में मदद कर सकता हूँ। उदाहरण: Tomato के लिए सबसे अच्छी कीमत किस market में है?",

      error:
        "अभी नवीनतम platform data प्राप्त नहीं कर पा रहा हूँ। कृपया फिर से कोशिश करें।",
    },
  };

  return (
    messages[language]?.[type] ||
    messages.en[type]
  );
}