// AHost.uz shared hosting: frontend va backend bitta domenda
// Development: localhost:8000, Production: sizning domeningiz
const IS_DEV = ["localhost", "127.0.0.1"].includes(window.location.hostname);
export const API_BASE = IS_DEV
  ? "https://qaydnomauz.uz"
  : "";  // Production: bo'sh = shu domen o'zi (https://qaydnomauz.uz)

export const API = {
  register: `${API_BASE}/api/auth/register/`,
  token: `${API_BASE}/api/auth/token/`,
  refresh: `${API_BASE}/api/auth/token/refresh/`,
  profile: `${API_BASE}/api/auth/profile/`,
  logout: `${API_BASE}/api/auth/logout/`,

  passwordReset: `${API_BASE}/api/auth/password/reset/`,
  passwordResetConfirm: `${API_BASE}/api/auth/password/reset/confirm/`,

  categories: `${API_BASE}/api/categories/`,
  posts: `${API_BASE}/api/posts/`,
  comments: `${API_BASE}/api/comments/`,
};

/* ===== SEO & Site Configuration ===== */
export const SITE = {
  name: "Qaydnoma Blog",
  url: IS_DEV ? "http://localhost:8000" : "https://qaydnomauz.uz",
  defaultTitle: "Qaydnoma Blog — Texnologiya va dasturlash haqida maqolalar",
  defaultDescription: "Qaydnoma Blog — dasturlash, texnologiya, web development va IT sohasidagi eng so'nggi maqolalar va qo'llanmalar.",
  defaultImage: IS_DEV ? "/assets/images/og-default.jpg" : "https://qaydnomauz.uz/assets/images/og-default.jpg",
  favicon: "assets/images/favicon.svg",
  locale: "uz_UZ",
  twitterHandle: "",  // @username bo'lsa qo'shing
  themeColor: "#ff2d2d",
};