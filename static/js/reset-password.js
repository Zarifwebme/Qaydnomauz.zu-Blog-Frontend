import { API } from "./config.js";
import { apiFetch } from "./api.js";
import { qs, setNavAuthState, showAlert } from "./ui.js";
import { getSafeParam, validatePassword, validatePasswordMatch, rateLimit } from "./security.js";

(async function init(){
  setNavAuthState();

  const form = qs("#form");
  const msg = qs("#msg");

  const uid = getSafeParam("uid");
  const token = getSafeParam("token");

  if (!uid || !token) {
    showAlert(msg, "Link noto‘g‘ri yoki eskirgan. Qaytadan parolni tiklang.", "warning");
    form.classList.add("d-none");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";

    if (!rateLimit("reset-password", 5, 60000)) {
      showAlert(msg, "Juda ko'p urinish. 1 daqiqa kutib turing.", "warning");
      return;
    }

    const p1 = qs("#password1").value;
    const p2 = qs("#password2").value;

    const passErr = validatePassword(p1);
    if (passErr) { showAlert(msg, passErr); return; }

    const matchErr = validatePasswordMatch(p1, p2);
    if (matchErr) { showAlert(msg, matchErr, "warning"); return; }

    try {
      await apiFetch(API.passwordResetConfirm, {
        method: "POST",
        body: {
          uid,
          token,
          new_password1: p1,
          new_password2: p2,
        },
      });

      showAlert(msg, "Parol yangilandi ✅ Endi login qiling.", "success");
      setTimeout(() => (location.href = "/login/"), 900);
    } catch (err) {
      showAlert(msg, err.message || "Parol yangilanmadi");
    }
  });
})();