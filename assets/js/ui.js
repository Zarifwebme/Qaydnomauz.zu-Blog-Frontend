import { isLoggedIn, logout } from "./auth.js";

/* ===== Date format ===== */
export function fmtDate(iso) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
  const mon = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${mon}, ${year}`;
}

/* ===== DOM helpers ===== */
export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

/* ===== Navbar auth (desktop + mobile) ===== */
export function setNavAuthState() {
  // Desktop (#navAuthBox) va mobile (#navAuthBoxMobile)
  const boxes = [qs("#navAuthBox"), qs("#navAuthBoxMobile")].filter(Boolean);
  if (boxes.length === 0) return;

  const loggedIn = isLoggedIn();

  const loggedInHtml = `
    <div class="d-flex align-items-center gap-2 flex-wrap nav-auth-wrap">
      <a class="btn btn-light border rounded-3 px-3 nav-auth-btn" href="profile.html">
        <i class="bi bi-person-circle me-1"></i> Profil
      </a>
      <button class="btn btn-outline-danger rounded-3 px-3 nav-auth-btn btn-logout" type="button">
        <i class="bi bi-box-arrow-right me-1"></i> Chiqish
      </button>
    </div>
  `;

  const guestHtml = `
    <div class="d-flex align-items-center gap-2 flex-wrap nav-auth-wrap">
      <a class="btn btn-outline-primary rounded-3 px-3 nav-auth-btn" href="login.html">
        <i class="bi bi-box-arrow-in-right me-1"></i> Kirish
      </a>
      <a class="btn btn-primary rounded-3 px-3 nav-auth-btn" href="register.html">
        <i class="bi bi-person-plus me-1"></i> Ro'yxatdan o'tish
      </a>
    </div>
  `;

  const html = loggedIn ? loggedInHtml : guestHtml;
  boxes.forEach(box => { box.innerHTML = html; });

  // Logout tugmalarga event
  if (loggedIn) {
    qsa(".btn-logout").forEach(btn => {
      btn.addEventListener("click", () => {
        showLogoutConfirm();
      });
    });
  }
}

/* ===== Logout tasdiqlash modal ===== */
function showLogoutConfirm() {
  // Modal allaqachon bo'lsa qayta yaratmaymiz
  let modal = document.getElementById("logoutModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "logoutModal";
    modal.className = "modal fade";
    modal.tabIndex = -1;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 shadow border-0">
          <div class="modal-body text-center p-4">
            <i class="bi bi-box-arrow-right text-danger" style="font-size:2.5rem"></i>
            <h5 class="fw-bold mt-3 mb-2">Tizimdan chiqish</h5>
            <p class="text-muted mb-4">Haqiqatan ham tizimdan chiqmoqchimisiz?</p>
            <div class="d-flex gap-2 justify-content-center">
              <button class="btn btn-light border rounded-3 px-4" data-bs-dismiss="modal">Bekor qilish</button>
              <button class="btn btn-danger rounded-3 px-4" id="logoutConfirmBtn">
                <i class="bi bi-box-arrow-right me-1"></i> Chiqish
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  const confirmBtn = modal.querySelector("#logoutConfirmBtn");
  const handler = async () => {
    confirmBtn.removeEventListener("click", handler);
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Chiqilmoqda...";
    await logout();
    bsModal.hide();
    location.href = "login.html";
  };
  confirmBtn.addEventListener("click", handler);
}

/* ===== Alerts ===== */
export function showAlert(el, msg, type="danger") {
  el.innerHTML = `<div class="alert alert-${type} py-2 mb-0">${escapeHtml(msg).replaceAll("\n","<br>")}</div>`;
}

/* ===== Escape ===== */
export function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ===== Category rang (avtomatik, category ko'p bo'lsa ham ishlaydi) ===== */
export function categoryColorClass(slugOrName = "") {
  const s = String(slugOrName || "post").toLowerCase().trim();

  const palette = [
    "tag-purple",
    "tag-blue",
    "tag-pink",
    "tag-green",
    "tag-navy",
    "tag-orange",
    "tag-teal",
  ];

  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }

  return palette[h % palette.length] || "tag-gray";
}