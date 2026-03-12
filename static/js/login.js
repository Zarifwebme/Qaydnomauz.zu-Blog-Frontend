import { login, isLoggedIn } from "./auth.js";
import { qs, setNavAuthState, showAlert } from "./ui.js";
import { rateLimit } from "./security.js";

(async function init(){
  setNavAuthState();
  if (isLoggedIn()) location.href = "/profile/";

  const form = qs("#form");
  const msg = qs("#msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";

    if (!rateLimit("login", 5, 60000)) {
      showAlert(msg, "Juda ko'p urinish. 1 daqiqa kutib turing.", "warning");
      return;
    }

    const username = qs("#username").value.trim();
    const password = qs("#password").value;

    if (!username || !password) {
      showAlert(msg, "Username va parol kiritilishi shart");
      return;
    }

    try {
      await login(username, password);
      location.href = "/profile/";
    } catch (err) {
      showAlert(msg, err.message || "Login xato");
    }
  });
})();