import { isLoggedIn, getProfile } from "./auth.js";
import { qs, setNavAuthState, showAlert } from "./ui.js";

(async function init() {
  setNavAuthState();

  if (!isLoggedIn()) {
    location.href = "login.html";
    return;
  }

  const msg = qs("#msg");

  try {
    const p = await getProfile();

    const username = p.username || "-";
    const email = p.email || "-";

    if (qs("#pUsername")) qs("#pUsername").textContent = username;
    if (qs("#pEmail")) qs("#pEmail").textContent = email;

    if (qs("#pUsernameTop")) qs("#pUsernameTop").textContent = username;
    if (qs("#pEmailTop")) qs("#pEmailTop").textContent = email;

  } catch (err) {
    showAlert(msg, err.message || "Profilni yuklab bo‘lmadi");
  }
})();