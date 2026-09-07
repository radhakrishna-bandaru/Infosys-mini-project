import { getToken } from "../utils/auth";
const LOCAL_ACCOUNTS_KEY = "smartFarmerLocalAccounts";

function getLocalAccounts() {
  try {
    return JSON.parse(
      localStorage.getItem(LOCAL_ACCOUNTS_KEY) || "[]"
    );
  } catch {
    return [];
  }
}

function saveLocalAccount(userData, response) {
  const accounts = getLocalAccounts();

  const account = {
    ...response.user,
    loginEmail: userData.email
      ? userData.email.trim().toLowerCase()
      : "",
    loginPhone: userData.phone
      ? userData.phone.trim()
      : "",
    password: userData.password,
    role: userData.role,
  };

  const existingIndex = accounts.findIndex(
    (item) =>
      (account.loginEmail &&
        item.loginEmail === account.loginEmail) ||
      (account.loginPhone &&
        item.loginPhone === account.loginPhone)
  );

  if (existingIndex >= 0) {
    accounts[existingIndex] = account;
  } else {
    accounts.push(account);
  }

  localStorage.setItem(
    LOCAL_ACCOUNTS_KEY,
    JSON.stringify(accounts)
  );
}
const API_BASE_URL = "https://smartfarmerr-backend.vercel.app/api";

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ==================== AUTH ====================

export async function loginUser(userData) {
  const accounts = getLocalAccounts();

  const email = userData.email
    ? userData.email.trim().toLowerCase()
    : "";

  const phone = userData.phone
    ? userData.phone.trim()
    : "";

  // First check locally registered account.
  // This avoids unnecessary Vercel 401 errors.
  const localUser = accounts.find((account) => {
    const emailMatch =
      email &&
      account.loginEmail === email;

    const phoneMatch =
      phone &&
      account.loginPhone === phone;

    return (
      (emailMatch || phoneMatch) &&
      account.role === userData.role &&
      account.password === userData.password
    );
  });

  if (localUser) {
    return {
      success: true,
      message: "Login successful",
      token: `local-${localUser.id}`,
      user: {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        phone: localUser.phone,
        role: localUser.role,
        location: localUser.location || "",
        farmName: localUser.farmName || "",
        businessName:
          localUser.businessName || "",
        createdAt: localUser.createdAt,
      },
    };
  }

  // If no local account exists, try backend.
  return await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function registerUser(userData) {
  const response = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  // Save account locally so login works
  // even if Vercel sends the next request
  // to another serverless instance.
  if (response.success && response.user) {
    saveLocalAccount(userData, response);
  }

  return response;
}

// ==================== CROPS ====================

export async function getCrops() {
  return request("/crops");
}

export async function createCrop(cropData) {
  return request("/crops", {
    method: "POST",
    body: JSON.stringify(cropData),
  });
}

export async function updateCrop(id, cropData) {
  return request(`/crops/${id}`, {
    method: "PUT",
    body: JSON.stringify(cropData),
  });
}

export async function deleteCrop(id) {
  return request(`/crops/${id}`, {
    method: "DELETE",
  });
}

// ==================== MARKETS ====================

export async function getMarkets(filters = {}) {
  const params = new URLSearchParams();

  if (filters.crop) {
    params.append("crop", filters.crop);
  }

  if (filters.location) {
    params.append("location", filters.location);
  }

  const query = params.toString();

  return request(
    `/markets${query ? `?${query}` : ""}`
  );
}

export async function getMarketById(id) {
  return request(`/markets/${id}`);
}

// ==================== PROFIT ====================

export async function calculateProfit(profitData) {
  return request("/profit/calculate", {
    method: "POST",
    body: JSON.stringify(profitData),
  });
}

// ==================== STORAGE ====================

export async function getStorages(filters = {}) {
  const params = new URLSearchParams();

  if (filters.crop) {
    params.append("crop", filters.crop);
  }

  if (filters.location) {
    params.append("location", filters.location);
  }

  if (filters.verified) {
    params.append("verified", "true");
  }

  const query = params.toString();

  return request(
    `/storage${query ? `?${query}` : ""}`
  );
}

export async function getStorageById(id) {
  return request(`/storage/${id}`);
}
export async function createStorage(storageData) {
  return request("/storage", {
    method: "POST",
    body: JSON.stringify(storageData),
  });
}

export async function updateStorage(id, storageData) {
  return request(`/storage/${id}`, {
    method: "PUT",
    body: JSON.stringify(storageData),
  });
}

export async function deleteStorage(id) {
  return request(`/storage/${id}`, {
    method: "DELETE",
  });
}

export async function updateStorageStatus(id, active) {
  return request(`/storage/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function updateStorageVerification(id, verified) {
  return request(`/storage/${id}/verification`, {
    method: "PATCH",
    body: JSON.stringify({ verified }),
  });
}
// ==================== BOOKINGS ====================

export async function getBookings(filters = {}) {
  const params = new URLSearchParams();

  if (filters.farmerId) {
    params.append("farmerId", filters.farmerId);
  }

  if (filters.storageId) {
    params.append("storageId", filters.storageId);
  }

  const query = params.toString();

  return request(
    `/bookings${query ? `?${query}` : ""}`
  );
}

const LOCAL_BOOKINGS_KEY = "smartFarmerLocalBookings";

function getLocalBookings() {
  try {
    return JSON.parse(
      localStorage.getItem(LOCAL_BOOKINGS_KEY) || "[]"
    );
  } catch {
    return [];
  }
}

function saveLocalBookings(bookings) {
  localStorage.setItem(
    LOCAL_BOOKINGS_KEY,
    JSON.stringify(bookings)
  );
}

export async function createBooking(bookingData) {
  try {
    const response = await request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });

    if (response.success && response.booking) {
      const bookings = getLocalBookings();

      const exists = bookings.some(
        (item) => item.id === response.booking.id
      );

      if (!exists) {
        bookings.push(response.booking);
        saveLocalBookings(bookings);
      }
    }

    return response;
  } catch (error) {
    // Vercel/API unavailable → local demo booking
    const booking = {
      id: `BOOK-${Date.now()}`,
      ...bookingData,
      quantity: Number(bookingData.quantity || 0),
      storageDays:
        Number(
          bookingData.storageDays ||
          bookingData.duration ||
          1
        ),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const bookings = getLocalBookings();
    bookings.push(booking);
    saveLocalBookings(bookings);

    return {
      success: true,
      message: "Storage booking request created successfully",
      booking,
      local: true,
    };
  }
}

export async function updateBookingStatus(id, status) {
  try {
    const response = await request(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    // Keep local booking status in sync
    try {
      const bookings = getLocalBookings();

      const updatedBookings = bookings.map((booking) =>
        String(booking.id) === String(id)
          ? {
              ...booking,
              status,
              updatedAt: new Date().toISOString(),
            }
          : booking
      );

      saveLocalBookings(updatedBookings);
    } catch (localError) {
      console.warn(
        "Local booking status update failed:",
        localError
      );
    }

    return response;
  } catch (error) {
    // Even if Vercel API fails, keep cancellation locally
    const bookings = getLocalBookings();

    const bookingExists = bookings.some(
      (booking) => String(booking.id) === String(id)
    );

    if (!bookingExists) {
      throw error;
    }

    const updatedBookings = bookings.map((booking) =>
      String(booking.id) === String(id)
        ? {
            ...booking,
            status,
            updatedAt: new Date().toISOString(),
          }
        : booking
    );

    saveLocalBookings(updatedBookings);

    return {
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBookings.find(
        (booking) => String(booking.id) === String(id)
      ),
      local: true,
    };
  }
}

// ==================== REQUIREMENTS ====================

const LOCAL_REQUIREMENTS_KEY =
  "smartFarmerLocalRequirements";

function getLocalRequirements() {
  try {
    const data = JSON.parse(
      localStorage.getItem(LOCAL_REQUIREMENTS_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveLocalRequirements(requirements) {
  localStorage.setItem(
    LOCAL_REQUIREMENTS_KEY,
    JSON.stringify(requirements)
  );
}

export async function getRequirements(buyerId) {
  const query = buyerId
    ? `?buyerId=${encodeURIComponent(buyerId)}`
    : "";

  try {
    const response = await request(
      `/requirements${query}`
    );

    return response;
  } catch (error) {
    const localRequirements =
      getLocalRequirements().filter(
        (item) =>
          !buyerId ||
          String(item.buyerId) === String(buyerId)
      );

    return {
      success: true,
      requirements: localRequirements,
      local: true,
    };
  }
}

export async function createRequirement(
  requirementData
) {
  try {
    const response = await request(
      "/requirements",
      {
        method: "POST",
        body: JSON.stringify(requirementData),
      }
    );

    if (response.success && response.requirement) {
      const requirements =
        getLocalRequirements();

      const exists = requirements.some(
        (item) =>
          String(item.id) ===
          String(response.requirement.id)
      );

      if (!exists) {
        requirements.push(response.requirement);
        saveLocalRequirements(requirements);
      }
    }

    return response;
  } catch (error) {
    console.warn(
      "Requirement API failed, saving locally:",
      error
    );

    const requirement = {
      id: `LOCAL-REQ-${Date.now()}`,
      ...requirementData,
      quantity: Number(
        requirementData.quantity || 0
      ),
      targetPrice: Number(
        requirementData.targetPrice || 0
      ),
      status: "active",
      createdAt:
        new Date().toISOString(),
    };

    const requirements =
      getLocalRequirements();

    requirements.push(requirement);

    saveLocalRequirements(requirements);

    return {
      success: true,
      message:
        "Requirement created successfully",
      requirement,
      local: true,
    };
  }
}

export async function updateRequirement(
  id,
  requirementData
) {
  try {
    const response = await request(
      `/requirements/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(requirementData),
      }
    );

    const requirements =
      getLocalRequirements();

    const updated =
      requirements.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              ...requirementData,
              id: item.id,
              updatedAt:
                new Date().toISOString(),
            }
          : item
      );

    saveLocalRequirements(updated);

    return response;
  } catch (error) {
    const requirements =
      getLocalRequirements();

    const updated =
      requirements.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              ...requirementData,
              id: item.id,
              updatedAt:
                new Date().toISOString(),
            }
          : item
      );

    saveLocalRequirements(updated);

    return {
      success: true,
      message:
        "Requirement updated locally",
      requirement:
        updated.find(
          (item) =>
            String(item.id) === String(id)
        ),
      local: true,
    };
  }
}

export async function deleteRequirement(id) {
  try {
    const response = await request(
      `/requirements/${id}`,
      {
        method: "DELETE",
      }
    );

    const requirements =
      getLocalRequirements().filter(
        (item) =>
          String(item.id) !== String(id)
      );

    saveLocalRequirements(requirements);

    return response;
  } catch (error) {
    const requirements =
      getLocalRequirements().filter(
        (item) =>
          String(item.id) !== String(id)
      );

    saveLocalRequirements(requirements);

    return {
      success: true,
      message:
        "Requirement deleted locally",
      local: true,
    };
  }
}
// ==================== ORDERS ====================

export async function getOrders(filters = {}) {
  const params = new URLSearchParams();

  if (filters.buyerId) {
    params.append("buyerId", filters.buyerId);
  }

  if (filters.farmerId) {
    params.append("farmerId", filters.farmerId);
  }

  const query = params.toString();

  return request(
    `/orders${query ? `?${query}` : ""}`
  );
}

export async function createOrder(orderData) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function updateOrderStatus(id, status) {
  return request(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteOrder(id) {
  return request(`/orders/${id}`, {
    method: "DELETE",
  });
}
export async function recommendProfit(recommendationData) {
  return request("/profit/recommend", {
    method: "POST",
    body: JSON.stringify(recommendationData),
  });
}
// NOTIFICATIONS

export async function getNotifications(userId) {
  const query = userId
    ? `?userId=${encodeURIComponent(userId)}`
    : "";

  return request(
    `/notifications${query}`
  );
}

export async function createNotification(
  notificationData
) {
  return request("/notifications", {
    method: "POST",
    body: JSON.stringify(notificationData),
  });
}

export async function markNotificationRead(id) {
  return request(
    `/notifications/${id}/read`,
    {
      method: "PATCH",
    }
  );
}

export async function deleteNotification(id) {
  return request(
    `/notifications/${id}`,
    {
      method: "DELETE",
    }
  );
}
// ==================== INVENTORY ====================

export async function getInventory(storageId) {
  const query = storageId
    ? `?storageId=${encodeURIComponent(storageId)}`
    : "";

  return request(
    `/inventory${query}`
  );
}

export async function createInventory(
  inventoryData
) {
  return request("/inventory", {
    method: "POST",
    body: JSON.stringify(inventoryData),
  });
}

export async function updateInventory(
  id,
  inventoryData
) {
  return request(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(inventoryData),
  });
}

export async function deleteInventory(id) {
  return request(`/inventory/${id}`, {
    method: "DELETE",
  });
}
// ==================== USERS ====================

export async function getUsers(filters = {}) {
  const params = new URLSearchParams();

  if (filters.role) {
    params.append("role", filters.role);
  }

  if (filters.search) {
    params.append("search", filters.search);
  }

  const query = params.toString();

  return request(
    `/users${query ? `?${query}` : ""}`
  );
}

export async function updateUserStatus(
  id,
  active
) {
  return request(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
export async function deleteUser(id) {
  return request(`/users/${id}`, {
    method: "DELETE",
  });
}