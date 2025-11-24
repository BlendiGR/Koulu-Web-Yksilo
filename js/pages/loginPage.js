import { login } from "../api/authApi.js";

(async function initLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      showAlert("Täytä kaikki kentät.");
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      const data = await login({ username, password });
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "./app.html";
    } catch (err) {
      showAlert(err.message || "Kirjautuminen epäonnistui.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();

function showAlert(msg, color = "red") {
  const el = document.getElementById("error-message");
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
}
