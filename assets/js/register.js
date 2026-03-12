import { register, login, isLoggedIn } from "./auth.js";
import { qs, setNavAuthState, showAlert } from "./ui.js";
import { validateUsername, validateEmail, validatePassword, validatePasswordMatch, rateLimit } from "./security.js";

(async function init(){
  setNavAuthState();
  if (isLoggedIn()) location.href = "profile.html";

  const form = qs("#form");
  const msg = qs("#msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";

    if (!rateLimit("register", 3, 60000)) {
      showAlert(msg, "Juda ko'p urinish. 1 daqiqa kutib turing.", "warning");
      return;
    }

    const username = qs("#username").value.trim();
    const email = qs("#email").value.trim();
    const password = qs("#password").value;
    const password2 = qs("#password2").value;

    const usernameErr = validateUsername(username);
    if (usernameErr) { showAlert(msg, usernameErr); return; }

    const emailErr = validateEmail(email);
    if (emailErr) { showAlert(msg, emailErr); return; }

    const passErr = validatePassword(password);
    if (passErr) { showAlert(msg, passErr); return; }

    const matchErr = validatePasswordMatch(password, password2);
    if (matchErr) { showAlert(msg, matchErr); return; }

    try {
      await register({ username, email: email || undefined, password, password2 });
      await login(username, password);
      location.href = "profile.html";
    } catch (err) {
      showAlert(msg, err.message || "Register xato");
    }
  });
})();