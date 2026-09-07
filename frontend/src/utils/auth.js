import {
  getStorage,
  setStorage,
  removeStorage,
} from "./storage";

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

  const saved = setStorage(key, user);

  if (saved && token) {
    localStorage.setItem(
      TOKEN_KEY,
      token
    );
  }

  return saved;
}

export function getLoggedInUser(role) {
  const key = ROLE_KEYS[role];

  if (!key) {
    return null;
  }

  return getStorage(key, null);
}

export function isLoggedIn(role) {
  return Boolean(getLoggedInUser(role));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logoutUser(role) {
  const key = ROLE_KEYS[role];

  if (!key) {
    return;
  }

  removeStorage(key);
  localStorage.removeItem(TOKEN_KEY);
}

export function logoutAllUsers() {
  Object.values(ROLE_KEYS).forEach((key) => {
    removeStorage(key);
  });

  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentRole() {
  if (isLoggedIn("admin")) {
    return "admin";
  }

  if (isLoggedIn("storage")) {
    return "storage";
  }

  if (isLoggedIn("buyer")) {
    return "buyer";
  }

  if (isLoggedIn("farmer")) {
    return "farmer";
  }

  return null;
}