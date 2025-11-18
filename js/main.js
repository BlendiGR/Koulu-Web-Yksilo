import { initHomePage } from "./pages/homePage.js";
import { initLoginPage } from "./pages/loginPage.js";
import { initRegisterPage } from "./pages/registerPage.js";
import { initAppHomePage } from "./pages/appHomePage.js";
import { initProfilePage } from "./pages/profilePage.js";

function initForCurrentPage() {
  const page = document.body.dataset.page;

  switch (page) {
    case "home":
      initHomePage();
      break;
    case "login":
      initLoginPage();
      break;
    case "register":
      initRegisterPage();
      break;
    case "app-home":
      initAppHomePage();
      break;
    case "profile":
      initProfilePage();
      break;
    default:
      break;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initForCurrentPage);
} else {
  initForCurrentPage();
}

