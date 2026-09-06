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
export async function calculateProfit(profitData) {
  return request("/profit/calculate", {
    method: "POST",
    body: JSON.stringify(profitData),
  });
}
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

export async function createBooking(bookingData) {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

export async function updateBookingStatus(
  id,
  status
) {
  return request(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
export async function getRequirements(buyerId) {
  const query = buyerId
    ? `?buyerId=${encodeURIComponent(buyerId)}`
    : "";

  return request(
    `/requirements${query}`
  );
}

export async function createRequirement(
  requirementData
) {
  return request("/requirements", {
    method: "POST",
    body: JSON.stringify(requirementData),
  });
}

export async function updateRequirement(
  id,
  requirementData
) {
  return request(`/requirements/${id}`, {
    method: "PUT",
    body: JSON.stringify(requirementData),
  });
}

export async function deleteRequirement(id) {
  return request(`/requirements/${id}`, {
    method: "DELETE",
  });
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

export async function updateOrderStatus(
  id,
  status
) {
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
/// ==================== INVENTORY ====================

export async function getInventory(storageId) {
  const query = storageId
    ? `?storageId=${encodeURIComponent(storageId)}`
    : "";

  return request(`/inventory${query}`);
}

export async function createInventory(inventoryData) {
  return request("/inventory", {
    method: "POST",
    body: JSON.stringify(inventoryData),
  });
}

export async function updateInventory(id, inventoryData) {
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

export async function updateStorageStatus(
  id,
  active
) {
  return request(`/storage/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function updateStorageVerification(
  id,
  verified
) {
  return request(`/storage/${id}/verification`, {
    method: "PATCH",
    body: JSON.stringify({ verified }),
  });
}