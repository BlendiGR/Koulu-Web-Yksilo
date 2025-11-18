import { login } from "../api/authApi.js";

export function initLoginPage() {
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
      showAlert("Kirjautuminen onnistui!", "green");

      setTimeout(() => {
        window.location.href = "/pages/app.html";
      }, 1000);
    } catch (err) {
      showAlert(err.message || "Kirjautuminen epäonnistui.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
}

function showAlert(msg, color = "red") {
  const el = document.getElementById("error-message");
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
}
