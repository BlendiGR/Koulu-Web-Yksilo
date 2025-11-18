const form = document.getElementById("login-form");

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
    const res = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || "Kirjautuminen epäonnistui.");
      return;
    }
    console.log(data);
    localStorage.setItem("user", JSON.stringify(data));
    showAlert("Kirjautuminen onnistui!", "green");

    setTimeout(() => {
      window.location.href = "/app/index.html";
    }, 1000);
  } catch {
    showAlert("Verkkovirhe. Yritä uudelleen.");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

function showAlert(msg, color = "red") {
  const el = document.getElementById("error-message");
  el.textContent = msg;
  el.style.color = color;
}
