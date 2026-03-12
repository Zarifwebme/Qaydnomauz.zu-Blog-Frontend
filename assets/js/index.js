import { API } from "./config.js";
import { apiFetch } from "./api.js";
import { qs, escapeHtml, fmtDate, categoryColorClass, showAlert } from "./ui.js";
import { logger } from "./security.js";

const state = {
  page: 1,
  categorySlug: "",
  q: "",
  last: null,
};

let categoriesMap = {};     // {id: "slug-or-name"} -> post.category ID uchun
let categoriesList = [];    // categories array

function buildPostsUrl() {
  const u = new URL(API.posts);
  u.searchParams.set("page", String(state.page));

  // Backend query: /api/posts/?category=slug
  if (state.categorySlug) u.searchParams.set("category", state.categorySlug);

  // Backend query: /api/posts/?q=search
  if (state.q) u.searchParams.set("q", state.q);

  return u.toString();
}

function renderCategories() {
  const bar = qs("#catBar");
  if (!bar) return;

  const pills = [];

  // "Barchasi"
  pills.push(`
    <button class="tag-pill ${!state.categorySlug ? "tag-pink" : "tag-gray"}"
            type="button" data-slug="">
      #Barchasi
    </button>
  `);

  for (const c of categoriesList) {
    const label = c.slug || c.name || "category";
    const active = state.categorySlug === (c.slug || "");
    const color = categoryColorClass(label);

    pills.push(`
      <button class="tag-pill ${active ? color : "tag-gray"}"
              type="button" data-slug="${escapeHtml(c.slug || "")}">
        #${escapeHtml(c.name || label)}
      </button>
    `);
  }

  bar.innerHTML = pills.join("");

  // click events
  bar.querySelectorAll("[data-slug]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.categorySlug = btn.getAttribute("data-slug") || "";
      state.page = 1;
      updateTitle();
      loadPosts().catch(console.error);
      renderCategories(); // active style update
    });
  });
}

function updateTitle() {
  const title = qs("#pageTitle");
  if (!title) return;

  if (state.categorySlug) {
    const found = categoriesList.find(c => c.slug === state.categorySlug);
    title.textContent = found ? `${found.name} postlari` : "Filterlangan postlar";
  } else if (state.q) {
    title.textContent = `Qidiruv: "${state.q}"`;
  } else {
    title.textContent = "Barcha blog postlari";
  }
}

function renderPostCard(p) {
  const label = categoriesMap[p.category] || "post";
  const color = categoryColorClass(label);

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <a class="text-decoration-none text-dark" href="#/posts/${encodeURIComponent(p.slug || p.id)}">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">

          <div class="ratio ratio-16x9 bg-light">
            <img
              src="${escapeHtml(p.image_url || "")}"
              alt="${escapeHtml(p.title || "")}"
              style="object-fit:cover;"
              loading="lazy"
              onerror="this.onerror=null;this.src='assets/images/404img.jpg';"
            >
          </div>

          <div class="card-body d-flex flex-column">
            <div class="text-muted small mb-1">${p.created_at ? fmtDate(p.created_at) : ""}</div>
            <h5 class="fw-bold mb-1">${escapeHtml(p.title || "")}</h5>
            <div class="text-muted mb-3">${escapeHtml(p.snippet || "")}</div>

            <div class="mt-auto">
              <span class="tag-pill tag-pill-soft ${color}">#${escapeHtml(label)}</span>
            </div>
          </div>

        </div>
      </a>
    </div>
  `;
}

async function loadCategories() {
  const bar = qs("#catBar");
  if (bar) bar.innerHTML = `<div class="text-muted">Category yuklanmoqda...</div>`;

  const data = await apiFetch(API.categories);
  const list = data?.results ?? data;

  categoriesList = Array.isArray(list) ? list : [];
  categoriesMap = {};

  for (const c of categoriesList) {
    categoriesMap[c.id] = c.slug || c.name || "post";
  }

  renderCategories();
}

async function loadPosts() {
  const grid = qs("#postsGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="col-12"><div class="text-muted">Yuklanmoqda...</div></div>`;

  const url = buildPostsUrl();
  logger.log("POSTS URL:", url);

  try {
    const data = await apiFetch(url);
    state.last = data;

    const items = data?.results ?? data;
    if (!Array.isArray(items)) {
      grid.innerHTML = `<div class="col-12"><div class="alert alert-warning">Postlar formati noto‘g‘ri</div></div>`;
      return;
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-12"><div class="alert alert-light border">Post topilmadi</div></div>`;
    } else {
      grid.innerHTML = items.map(renderPostCard).join("");
    }

    // pagination
    const totalCount = data.count ?? 0;
    const pageSize = 12;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    renderPagination(state.page, totalPages);

  } catch (err) {
    logger.error("POSTS ERROR:", err);
    grid.innerHTML = "";
    const alertBox = document.createElement("div");
    alertBox.className = "col-12";
    alertBox.innerHTML = `<div class="alert alert-danger">Postlarni yuklab bo‘lmadi: ${escapeHtml(err.message || "xato")}</div>`;
    grid.appendChild(alertBox);
  }
}

function goToPage(p) {
  state.page = p;
  loadPosts().catch(console.error);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getPageRange(current, total) {
  const delta = 2;
  const pages = [];

  // always show first page
  pages.push(1);

  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  if (rangeStart > 2) pages.push("...");

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < total - 1) pages.push("...");

  // always show last page (if > 1)
  if (total > 1) pages.push(total);

  return pages;
}

function renderPagination(current, total) {
  const box = qs("#paginationBox");
  if (!box) return;

  if (total <= 1) {
    box.innerHTML = "";
    return;
  }

  const pages = getPageRange(current, total);
  let html = "";

  // Prev arrow
  html += `<button class="pg-btn pg-arrow ${current <= 1 ? "disabled" : ""}"
             ${current <= 1 ? "disabled" : ""} data-page="${current - 1}">
             <i class="bi bi-chevron-left"></i>
           </button>`;

  for (const p of pages) {
    if (p === "...") {
      html += `<span class="pg-dots">…</span>`;
    } else {
      html += `<button class="pg-btn ${p === current ? "pg-active" : ""}"
                 data-page="${p}">${p}</button>`;
    }
  }

  // Next arrow
  html += `<button class="pg-btn pg-arrow ${current >= total ? "disabled" : ""}"
             ${current >= total ? "disabled" : ""} data-page="${current + 1}">
             <i class="bi bi-chevron-right"></i>
           </button>`;

  box.innerHTML = html;

  box.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      const pg = parseInt(btn.dataset.page);
      if (!isNaN(pg) && pg >= 1 && pg <= total && pg !== current) goToPage(pg);
    });
  });
}

function syncSearchInputs(val) {
  const qTop = qs("#qTop");
  const qMobile = qs("#qMobile");
  if (qTop && qTop.value !== val) qTop.value = val;
  if (qMobile && qMobile.value !== val) qMobile.value = val;
}

function setupSearch() {
  const top = qs("#qTop");
  const mobile = qs("#qMobile");

  let t = null;
  const onInput = (value) => {
    clearTimeout(t);
    syncSearchInputs(value);
    t = setTimeout(() => {
      state.q = (value || "").trim();
      state.page = 1;
      updateTitle();
      if (window.location.hash.startsWith("#/posts/")) {
        window.location.hash = "#/";
      }
      loadPosts().catch(console.error);
    }, 350);
  };

  if (top) top.addEventListener("input", () => onInput(top.value));
  if (mobile) mobile.addEventListener("input", () => onInput(mobile.value));
}

export async function initHome() {
  setupSearch();

  updateTitle();

  // MUHIM: avval categories -> keyin posts (categoryMap tayyor bo'ladi)
  await loadCategories();
  await loadPosts();
}