const ROLE_KEYS = {
  farmer: "farmerUser",
  storage: "storageUser",
  buyer: "buyerUser",
  admin: "adminUser",
};

const TOKEN_KEY = "smartFarmerToken";

export function loginUser(role, user, token) {
  const key = ROLE_KEYS[role];

  if (!key) return false;

  localStorage.setItem(key, JSON.stringify(user));

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  return true;
}

export function getLoggedInUser(role) {
  const key = ROLE_KEYS[role];

  if (!key) return null;

  try {
    const user = localStorage.getItem(key);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(role) {
  return Boolean(getLoggedInUser(role));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logoutUser(role) {
  const key = ROLE_KEYS[role];

  if (key) {
    localStorage.removeItem(key);
  }

  localStorage.removeItem(TOKEN_KEY);
}

export function logoutAllUsers() {
  Object.values(ROLE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });

  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentRole() {
  if (isLoggedIn("admin")) return "admin";
  if (isLoggedIn("storage")) return "storage";
  if (isLoggedIn("buyer")) return "buyer";
  if (isLoggedIn("farmer")) return "farmer";

  return null;
}