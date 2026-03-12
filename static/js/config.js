// Django backend bilan bitta domenda ishlaydi
export const API_BASE = "https://qaydnomauz.uz";  // Relative URL — shu domen o'zi (https://qaydnomauz.uz)

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
  url: "https://qaydnomauz.uz",
  defaultTitle: "Qaydnoma Blog — Texnologiya va dasturlash haqida maqolalar",
  defaultDescription: "Qaydnoma Blog — dasturlash, texnologiya, web development va IT sohasidagi eng so'nggi maqolalar va qo'llanmalar.",
  defaultImage: "https://qaydnomauz.uz/static/images/og-default.jpg",
  favicon: "/static/images/favicon.svg",
  locale: "uz_UZ",
  twitterHandle: "",  // @username bo'lsa qo'shing
  themeColor: "#ff2d2d",
};