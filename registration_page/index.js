const form = document.getElementById("login-form");
const showError = (msg) => showAlert(msg, "red");
const showSuccess = (msg) => showAlert(msg, "green");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const rawUsername = (formData.get("username") || "").toString();
  const rawEmail = (formData.get("email") || "").toString();
  const rawPassword = (formData.get("password") || "").toString();
  const rawConfirm = (formData.get("confirm-password") || "").toString();

  const username = rawUsername.trim();
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword;
  const confirmPassword = rawConfirm;

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
      showError("Käyttäjätunnuksen on oltava 3-20 merkkiä pitkä.");
      return;
  }

  const available = await fetchUsernameAvailability(username);
  if (available === false) {
    showError("Käyttäjätunnus on jo varattu.");
    return;
  } else if (available === null) {
    showError("Käyttäjätunnuksen tarkistus epäonnistui. Yritä uudelleen.");
    return;
  }

  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  const userData = { username, password, email };

  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
        }),
      }
    );

    if (response.ok) {
      showSuccess("Rekisteröityminen onnistui!");
      setTimeout(() => {
        window.location.href = "../login_page/index.html";
      }, 1200);
      return;
    }
  } catch (err) {
    showError("Virhe. Yritä uudelleen.");
    console.log(err);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

async function fetchUsernameAvailability(username) {
  try {
    const res = await fetch(
      `https://media2.edu.metropolia.fi/restaurant/api/v1/users/available/${encodeURIComponent(
        username
      )}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.available === "boolean" ? data.available : null;
  } catch {
    return null;
  }
}

function showAlert(message, color = "red") {
  const el = document.getElementById("error-message");
  el.textContent = message;
  el.style.color = color;
}
