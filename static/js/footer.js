/**
 * footer.js — Reusable footer component
 * Inserts the same footer into every page
 */

(function () {
  const year = new Date().getFullYear();

  // Detect if we're on index.html (SPA) — links use hash routes
  const isIndex = window.location.pathname === "/"
    || window.location.pathname.endsWith("/");

  const homeLink = "/";

  const footerHTML = `
<footer class="site-footer">
  <div class="container py-4" style="max-width:1100px;">
    <div class="row g-3 align-items-start">

      <!-- Brand + description -->
      <div class="col-12 col-md-4">
        <a href="${homeLink}" class="footer-brand">Qaydnoma Blog</a>
        <p class="mt-2 mb-0 small">Dasturlash, texnologiya va IT sohasidagi foydali maqolalar va qo'llanmalar.</p>
      </div>

      <!-- Links -->
      <div class="col-6 col-md-3">
        <h6 class="fw-semibold mb-2" style="color:var(--text);font-size:.85rem;">Sahifalar</h6>
        <ul class="footer-links">
          <li><a href="${homeLink}">Bosh sahifa</a></li>
          <li><a href="/privacy/">Maxfiylik siyosati</a></li>
        </ul>
      </div>

      <!-- Contact -->
      <div class="col-6 col-md-3">
        <h6 class="fw-semibold mb-2" style="color:var(--text);font-size:.85rem;">Aloqa</h6>
        <ul class="footer-links">
          <li><a href="mailto:info@qaydnomauz.uz"><i class="bi bi-envelope me-1"></i>info@qaydnomauz.uz</a></li>
        </ul>
      </div>

      <!-- Social -->
      <div class="col-12 col-md-2">
        <h6 class="fw-semibold mb-2" style="color:var(--text);font-size:.85rem;">Tarmoqlar</h6>
        <div class="footer-social">
          <a href="https://t.me/qaydnomauz" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <i class="bi bi-telegram"></i>
          </a>
          <a href="https://github.com/qaydnomauz" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i class="bi bi-github"></i>
          </a>
          <a href="https://instagram.com/qaydnomauz" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i class="bi bi-instagram"></i>
          </a>
        </div>
      </div>

    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom pt-3 mt-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
      <span>&copy; ${year} Qaydnoma Blog. Barcha huquqlar himoyalangan.</span>
      <a href="/privacy/" class="small">Maxfiylik siyosati</a>
    </div>
  </div>
</footer>
`;

  // Insert before </body>
  document.addEventListener("DOMContentLoaded", function () {
    // If footer already exists, skip
    if (document.querySelector(".site-footer")) return;
    document.body.insertAdjacentHTML("beforeend", footerHTML);
  });
})();
