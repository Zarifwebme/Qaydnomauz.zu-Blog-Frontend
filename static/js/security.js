/**
 * security.js — Frontend security utilities
 * XSS prevention, input validation, safe DOM rendering, rate limiting
 */

/* ===== XSS Prevention: HTML Escape ===== */
const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
  "/": "&#x2F;",
  "`": "&#x60;",
};

export function escapeHtml(str) {
  return String(str).replace(/[&<>"'`/]/g, (ch) => ESCAPE_MAP[ch]);
}

/* ===== Safe DOM Helpers ===== */

/** Set text content safely — never uses innerHTML */
export function safeText(el, text) {
  if (!el) return;
  el.textContent = text ?? "";
}

/** Create element with text content */
export function createTextEl(tag, text, className = "") {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}

/** Safely set image src with fallback */
export function safeSetImage(imgEl, src, alt = "", fallback = "/static/images/404img.jpg") {
  if (!imgEl) return;
  imgEl.alt = alt || "";
  imgEl.onerror = function () {
    this.onerror = null;
    this.src = fallback;
  };
  imgEl.src = src || fallback;
}

/* ===== Input Validation ===== */

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(val) {
  const v = (val || "").trim();
  if (!v) return "Username kiritilishi shart";
  if (v.length < 3) return "Username kamida 3 ta belgi bo'lishi kerak";
  if (v.length > 30) return "Username 30 ta belgidan oshmasin";
  if (!USERNAME_RE.test(v)) return "Username faqat harf, raqam va _ bo'lishi mumkin";
  return null;
}

export function validateEmail(val) {
  const v = (val || "").trim();
  if (!v) return "Email kiritilishi shart";
  if (!EMAIL_RE.test(v)) return "Email formati noto'g'ri";
  return null;
}

export function validatePassword(val) {
  if (!val) return "Parol kiritilishi shart";
  if (val.length < 6) return "Parol kamida 6 ta belgi bo'lishi kerak";
  return null;
}

export function validatePasswordMatch(p1, p2) {
  if (p1 !== p2) return "Parollar bir xil emas";
  return null;
}

/* ===== URL Parameter Validation ===== */

/** Safely get and validate URL search params */
export function getSafeParam(name) {
  try {
    const url = new URL(window.location.href);
    const val = url.searchParams.get(name);
    if (!val) return "";
    // Strip any HTML/script tags from param values
    return val.replace(/[<>"'`]/g, "").trim();
  } catch {
    return "";
  }
}

/* ===== Rate Limiting (client-side) ===== */

const rateLimitMap = new Map();

/**
 * Simple client-side rate limiter.
 * Returns true if action is allowed, false if rate limited.
 * @param {string} key - Action identifier
 * @param {number} maxAttempts - Max attempts in window
 * @param {number} windowMs - Time window in ms (default: 60s)
 */
export function rateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  let entry = rateLimitMap.get(key);

  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 1 };
    rateLimitMap.set(key, entry);
    return true;
  }

  entry.count++;
  if (entry.count > maxAttempts) return false;
  return true;
}

/* ===== Sanitize for Markdown (with DOMPurify) ===== */

/** Render markdown safely using marked + DOMPurify */
export function renderSafeMarkdown(text) {
  if (!text) return "";
  const raw = window.marked ? window.marked.parse(text) : escapeHtml(text);
  return window.DOMPurify ? window.DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      "h1","h2","h3","h4","h5","h6","p","br","hr","ul","ol","li",
      "a","strong","em","code","pre","blockquote","img","table",
      "thead","tbody","tr","th","td","del","input","details","summary",
      "div","span"
    ],
    ALLOWED_ATTR: [
      "href","src","alt","title","class","id","target","rel",
      "type","checked","disabled"
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  }) : escapeHtml(text);
}

/* ===== Console wrapper for production ===== */

const IS_PROD = !["localhost", "127.0.0.1", ""].includes(window.location.hostname);

export const logger = {
  log: (...args) => { if (!IS_PROD) console.log(...args); },
  warn: (...args) => { if (!IS_PROD) console.warn(...args); },
  error: (...args) => { if (!IS_PROD) console.error(...args); },
};
