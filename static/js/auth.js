import { API } from "./config.js";
import { apiFetch } from "./api.js";

const LS_KEY = "zarifblog_auth";

export function getAuth() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Faqat access field bo'lsa qaytaramiz
    if (parsed && typeof parsed.access === "string") return parsed;
    return null;
  } catch {
    localStorage.removeItem(LS_KEY);
    return null;
  }
}
export function setAuth(data) {
  if (!data?.access) return;
  // Faqat access tokenni saqlaymiz (refresh HttpOnly cookie'da)
  localStorage.setItem(LS_KEY, JSON.stringify({ access: data.access }));
}
export function clearAuth() {
  localStorage.removeItem(LS_KEY);
  // Boshqa session ma'lumotlarini ham tozalaymiz
  sessionStorage.clear();
}

export function isLoggedIn() {
  const a = getAuth();
  return !!(a && a.access);
}

export async function login(username, password) {
  const res = await fetch(API.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Login xato");
  setAuth({ access: data.access });
  return data;
}

export async function register(payload) {
  const res = await fetch(API.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    // DRF errorlar: {field: ["..."]}
    const msg = Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(", "):v}`).join("\n");
    throw new Error(msg || "Register xato");
  }
  return data;
}

export async function refreshAccessToken() {
  // Refresh token HttpOnly cookie'da — avtomatik yuboriladi
  try {
    const res = await fetch(API.refresh, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      clearAuth();
      return null;
    }
    const data = await res.json();
    setAuth({ access: data.access });
    return data.access;
  } catch {
    clearAuth();
    return null;
  }
}

export async function getProfile() {
  return apiFetch(API.profile, { auth: true });
}

export async function logout() {
  try {
    await fetch(API.logout, {
      method: "POST",
      credentials: "include",
    });
  } catch (_) {}
  clearAuth();
}