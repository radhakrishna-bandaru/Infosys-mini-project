const STORAGE_KEYS = {
  farmerUser: "farmerUser",
  storageUser: "storageUser",
  buyerUser: "buyerUser",
  adminUser: "adminUser",

  farmerCrops: "farmerCrops",
  farmerBookings: "farmerBookings",
  farmerProfile: "farmerProfile",

  storageProfile: "storageProfile",
  storageInventory: "storageInventory",
  storageBookings: "storageBookings",

  buyerProfile: "buyerProfile",
  buyerRequirements: "buyerRequirements",
  buyerOrders: "buyerOrders",

  adminUsers: "adminUsers",
  adminStorages: "adminStorages",
  adminBuyers: "adminBuyers",
  adminSettings: "adminSettings",

  notifications: "notifications",
};

export function getStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to read localStorage:", error);
    return fallback;
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Failed to save localStorage:", error);
    return false;
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Failed to remove localStorage:", error);
    return false;
  }
}

export function clearAppStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function exportAppStorage() {
  const data = {};

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = getStorage(key, null);
  });

  return data;
}

export { STORAGE_KEYS };
