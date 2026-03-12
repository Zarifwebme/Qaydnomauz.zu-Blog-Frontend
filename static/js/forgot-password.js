import { API } from "./config.js";
import { apiFetch } from "./api.js";
import { qs, setNavAuthState, showAlert } from "./ui.js";
import { validateEmail, rateLimit } from "./security.js";

(async function init(){
  setNavAuthState();

  const form = qs("#form");
  const msg = qs("#msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";

    const email = qs("#email").value.trim();

    const emailErr = validateEmail(email);
    if (emailErr) { showAlert(msg, emailErr); return; }

    if (!rateLimit("forgot-password", 3, 60000)) {
      showAlert(msg, "Juda ko'p urinish. 1 daqiqa kutib turing.", "warning");
      return;
    }

    try {
      await apiFetch(API.passwordReset, { method: "POST", body: { email } });
      showAlert(msg, "Emailga link yuborildi ✅ Pochtani tekshiring.", "success");
    } catch (err) {
      showAlert(msg, err.message || "Xatolik");
    }
  });
})();