import { API } from "./config.js";
import { apiFetch } from "./api.js";
import { isLoggedIn } from "./auth.js";
import { escapeHtml, fmtDate, qs, showAlert } from "./ui.js";
import { logger, renderSafeMarkdown } from "./security.js";
import { setPostSEO } from "./seo.js";

let currentPostId = null;

/* ===== Helpers ===== */
function nl2brSafe(text) {
  return escapeHtml(text || "").replaceAll("\n", "<br>");
}

/* Markdown → safe HTML */
function renderMarkdown(text) {
  if (!text) return "";
  return renderSafeMarkdown(text);
}

function safeSetText(sel, text) {
  const el = qs(sel);
  if (el) el.textContent = text ?? "";
}

function safeSetHtml(sel, html) {
  const el = qs(sel);
  if (el) el.innerHTML = html ?? "";
}

function safeSetImg(sel, src, alt) {
  const el = qs(sel);
  if (el) {
    el.onerror = function () { this.onerror = null; this.src = "/static/images/404img.jpg"; };
    el.src = src || "/static/images/404img.jpg";
    el.alt = alt || "";
  }
}

/* Comment card renderer (highlight optional) */
function renderCommentCard(c, { highlight = false } = {}) {
  const user = escapeHtml(c.user || "User");
  const content = nl2brSafe(c.content || "");
  const date = c.created_at ? fmtDate(c.created_at) : "";

  return `
    <div class="card border-0 shadow-sm rounded-4 p-3 mb-2 comment-item ${highlight ? "newly-added" : ""}">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">${user}</div>
        <div class="text-muted small">${date}</div>
      </div>
      <div class="mt-2">${content}</div>
    </div>
  `;
}

/* ===== Post detail ===== */
async function loadPost(slug) {
  const base = String(API.posts);
  const url = base.endsWith("/") ? `${base}${slug}/` : `${base}/${slug}/`;

  const data = await apiFetch(url);

  const post = data.post;
  const relatedPosts = data.related_posts || [];

  // post.id ni qaytaramiz — commentlar uchun kerak
  currentPostId = post.id;

  safeSetImg("#postImg", post.image_url, post.title);
  safeSetText("#postTitle", post.title || "");
  safeSetText("#postSnippet", post.snippet || "");
  safeSetText("#postDate", post.created_at ? fmtDate(post.created_at) : "");
  safeSetHtml("#postDesc", renderMarkdown(post.description));

  // Code bloklarni syntax highlight qilish
  document.querySelectorAll("#postDesc pre code").forEach((el) => {
    if (window.hljs) window.hljs.highlightElement(el);
  });

  safeSetHtml("#postViews", `<i class="bi bi-eye"></i> ${post.views ?? 0}`);

  // Dynamic SEO: update title, description, OG, Twitter meta tags
  setPostSEO(post);

  renderRelatedPosts(relatedPosts);
}

function renderRelatedPosts(posts) {
  const box = qs("#relatedPosts");
  if (!box) return;

  if (!posts || posts.length === 0) {
    box.innerHTML = `<div class="text-muted small">Bu kategoriyada boshqa post yo‘q.</div>`;
    return;
  }

  box.innerHTML = posts.map((post) => {
    const identifier = post.slug || post.id;
    const href = `#/posts/${encodeURIComponent(identifier)}`;
    return `
    <div class="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
      ${
        post.image_url
          ? `
          <a href="${href}">
            <img src="${post.image_url}" alt="${escapeHtml(post.title || "")}" class="w-100" style="height:160px; object-fit:cover;" onerror="this.onerror=null;this.src='/static/images/404img.jpg';">
          </a>
          `
          : ""
      }

      <div class="p-3">
        <div class="text-muted small mb-1">
          ${post.created_at ? fmtDate(post.created_at) : ""} • <i class="bi bi-eye"></i> ${post.views ?? 0}
        </div>

        <h6 class="mb-2">
          <a href="${href}" class="text-decoration-none text-dark">
            ${escapeHtml(post.title || "")}
          </a>
        </h6>

        <div class="text-muted small">
          ${escapeHtml(post.snippet || "")}
        </div>
      </div>
    </div>
  `;
  }).join("");
}

/* ===== Comments list ===== */
async function loadComments(postId) {
  const listBox = qs("#commentsList");
  if (!listBox) return;

  const u = new URL(API.comments);
  u.searchParams.set("post", String(postId));

  listBox.innerHTML = `<div class="text-muted small">Kommentlar yuklanmoqda...</div>`;

  try {
    const data = await apiFetch(u.toString());
    const list = data?.results ?? data;

    if (!Array.isArray(list) || list.length === 0) {
      listBox.innerHTML = `<div class="text-muted">Hozircha komment yo‘q.</div>`;
      return;
    }

    listBox.innerHTML = list.map((c) => renderCommentCard(c)).join("");

    // ✅ doim tepadan tursin
    listBox.scrollTop = 0;

  } catch (err) {
    logger.error("LOAD COMMENTS ERROR:", err);
    listBox.innerHTML = `
      <div class="alert alert-warning">
        Kommentlarni yuklab bo‘lmadi: ${escapeHtml(err.message || "xato")}
      </div>
    `;
  }
}

/* ===== Comment form: NO refresh, NO full reload ===== */
function setupCommentBox(postId) {
  const info = qs("#commentInfo");
  const form = qs("#commentForm");
  const textarea = qs("#commentText");
  const btn = qs("#btnSendComment"); // post.html'da bo‘lishi shart

  if (!info || !form || !textarea || !btn) {
    logger.warn("Comment UI element topilmadi (#commentInfo/#commentForm/#commentText/#btnSendComment)");
    return;
  }

  if (!isLoggedIn()) {
    showAlert(info, "Sharh yozish uchun avval tizimga kiring yoki ro'yhatdan o'ting.", "warning");
    form.classList.add("d-none");
    return;
  }

  info.innerHTML = "";
  form.classList.remove("d-none");

  // submit bo‘lsa ham refresh bo‘lmasin
  form.onsubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  btn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    info.innerHTML = "";
    const content = (textarea.value || "").trim();

    if (!content) {
      showAlert(info, "Sharh matnini yozing.", "warning");
      return;
    }

    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = "Yuborilmoqda...";

    try {
      // POST -> comment object qaytadi deb hisoblaymiz
      const created = await apiFetch(API.comments, {
        method: "POST",
        auth: true,
        body: {
          post: Number(postId),
          content,
        },
      });

      textarea.value = "";
      textarea.focus();

      const listBox = qs("#commentsList");
      if (listBox) {
        // "Hozircha komment yo‘q" bo‘lsa tozalash
        const t = (listBox.textContent || "").toLowerCase();
        if (t.includes("hozircha") && t.includes("komment")) listBox.innerHTML = "";

        // ✅ listni refresh qilmaymiz — faqat tepaga qo‘shamiz
        listBox.insertAdjacentHTML("afterbegin", renderCommentCard(created, { highlight: true }));

        // highlight o‘chadi
        const first = listBox.querySelector(".comment-item.newly-added");
        if (first) setTimeout(() => first.classList.remove("newly-added"), 1500);

        // ✅ doim tepadan tursin
        listBox.scrollTop = 0;
      }

      // success alert chiqarmaymiz

    } catch (err) {
      logger.error("COMMENT POST ERROR:", err);
      showAlert(info, err.message || "Sharh yuborilmadi");
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  };
}

/* ===== Init (called by router) ===== */
export async function initPost(slug) {
  // Reset previous content
  safeSetText("#postTitle", "");
  safeSetImg("#postImg", "", "");
  safeSetHtml("#postDesc", `<div class="text-muted">Yuklanmoqda...</div>`);
  safeSetHtml("#postViews", "");
  safeSetText("#postDate", "");
  safeSetHtml("#relatedPosts", "");
  safeSetHtml("#commentsList", "");
  const form = qs("#commentForm");
  if (form) form.classList.add("d-none");
  const info = qs("#commentInfo");
  if (info) info.innerHTML = "";
  currentPostId = null;

  if (!slug) {
    safeSetHtml("#postDesc", `<div class="alert alert-warning">Post topilmadi</div>`);
    return;
  }

  try {
    await loadPost(slug);
  } catch (err) {
    logger.error("DETAIL ERROR:", err);
    safeSetHtml("#postDesc", `<div class="alert alert-danger">Post yuklanmadi: ${escapeHtml(err.message || "xato")}</div>`);
    return;
  }

  setupCommentBox(currentPostId);
  await loadComments(currentPostId);
}