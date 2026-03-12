import { getAuth, refreshAccessToken, clearAuth } from "./auth.js";
import { logger } from "./security.js";

export async function apiFetch(url, opts = {}) {
  const {
    method = "GET",
    auth = false,
    body = null,
    headers = {},
  } = opts;

  const h = { ...headers };
  if (body !== null) h["Content-Type"] = "application/json";

  if (auth) {
    const a = getAuth();
    if (a?.access) h["Authorization"] = `Bearer ${a.access}`;
  }

  const doReq = async () => {
    const res = await fetch(url, {
      method,
      headers: h,
      credentials: "include",
      body: body !== null ? JSON.stringify(body) : null,
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { res, data };
  };

  let { res, data } = await doReq();

  // Access eskirgan bo‘lsa → refresh qilib qayta uramiz
  if (auth && res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      clearAuth();
      window.location.href = "login.html";
      return;
    }
    h["Authorization"] = `Bearer ${newAccess}`;
    ({ res, data } = await doReq());
  }

  // Refresh'dan keyin ham 401 bo'lsa — butunlay sessiya tugagan
  if (auth && res.status === 401) {
    clearAuth();
    window.location.href = "login.html";
    return;
  }

  if (!res.ok) {
    let msg = "So‘rov xato";
  
    if (data && typeof data === "object") {
      if (data.detail) msg = data.detail;
      else {
        msg = Object.entries(data)
          .map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n");
      }
    } else if (typeof data === "string") msg = data;

    logger.error("API error:", res.status, msg);
    throw new Error(msg);
  }
  return data;
}