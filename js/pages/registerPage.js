import { registerUser, checkUsernameAvailability } from "../api/usersApi.js";

(async function initRegisterPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const showError = (msg) => showAlert(msg, "red");
  const showSuccess = (msg) => showAlert(msg, "green");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const username = (formData.get("username") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const password = (formData.get("password") || "").toString();
    const confirmPassword = (formData.get("confirm-password") || "").toString();

    switch (true) {
      case !username || !email || !password || !confirmPassword:
        showError("Kaikki kentät on täytettävä.");
        return;

      case password !== confirmPassword:
        showError("Salasanat eivät täsmää.");
        return;

      case password.length < 6:
        showError("Salasanan on oltava vähintään 6 merkkiä pitkä.");
        return;

      case !/\S+@\S+\.\S+/.test(email):
        showError("Sähköpostiosoite ei ole kelvollinen.");
        return;

      case !/^[a-zA-Z0-9_]+$/.test(username):
        showError(
          "Käyttäjätunnus voi sisältää vain kirjaimia, numeroita ja alaviivoja."
        );
        return;

      case username.length < 3 || username.length > 20:
        showError("Käyttäjätunnuksen on oltava 3–20 merkkiä pitkä.");
        return;
    }

    const available = await checkUsernameAvailability(username);

    if (available === false) {
      showError("Käyttäjätunnus on jo varattu.");
      return;
    } else if (available === null) {
      showError("Käyttäjätunnuksen tarkistus epäonnistui. Yritä uudelleen.");
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await registerUser({ username, password, email });
      showSuccess("Rekisteröityminen onnistui!");
      window.location.href = "./login.html";
    } catch (err) {
      showError("Virhe. Yritä uudelleen.");
      console.error(err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();

function showAlert(message, color = "red") {
  const el = document.getElementById("error-message");
  if (!el) return;
  el.textContent = message;
  el.style.color = color;
}
