import { ensureAuthenticated } from "../components/authGuard.js";
import {
  uploadAvatar,
  refreshUserByToken,
  deleteUserByToken,
  UPLOADS_BASE,
} from "../api/usersApi.js";

export async function initProfilePage() {
  const userData = await ensureAuthenticated();
  if (!userData) return;

  const token = userData.token;

  renderProfileHeader(userData);
  setupAvatar(userData);
  setupAvatarForm(token);
  setupDeleteAccount(token);
  setupLogout();

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
}

function renderProfileHeader(userData) {
  const username = document.createElement("h2");
  username.textContent = `Hei ${userData.data.username}!`;
  const usernameTarget = document.getElementById("welcome-username");
  if (usernameTarget) {
    usernameTarget.appendChild(username);
  }

  const email = document.createElement("p");
  email.textContent = userData.data.email;
  const emailTarget = document.getElementById("profile-email");
  if (emailTarget) {
    emailTarget.appendChild(email);
  }
}

function setupAvatar(userData) {
  const avatarImg = document.getElementById("profile-avatar");
  const avatarImgNav = document.getElementById("profile-avatar-nav");

  if (!avatarImg || !avatarImgNav) return;

  if (userData.data.avatar) {
    const url = `${UPLOADS_BASE}${encodeURIComponent(userData.data.avatar)}`;
    avatarImg.src = url;
    avatarImgNav.src = url;
  } else {
    avatarImg.src = "/public/avatar.jpg";
    avatarImgNav.src = "/public/avatar.jpg";
  }
}

function setupAvatarForm(token) {
  const form = document.getElementById("avatar-change");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      await uploadAvatar(token, formData);
    } catch (err) {
      console.error(err);
      return;
    }

    try {
      const freshUserData = await refreshUserByToken(token);

      const storedRaw = localStorage.getItem("user");
      const stored = storedRaw ? JSON.parse(storedRaw) : null;
      if (stored) {
        stored.data = freshUserData;
        localStorage.setItem("user", JSON.stringify(stored));
      }

      if (freshUserData.avatar) {
        const avatarUrl = `${UPLOADS_BASE}${encodeURIComponent(
          freshUserData.avatar
        )}?t=${Date.now()}`;

        const avatarImg = document.getElementById("profile-avatar");
        const avatarImgNav = document.getElementById("profile-avatar-nav");
        if (avatarImg) avatarImg.src = avatarUrl;
        if (avatarImgNav) avatarImgNav.src = avatarUrl;
      }
    } catch (err) {
      console.error("profile update error:", err);
      localStorage.removeItem("user");
      window.location.href = "/pages/login.html";
    }
  });
}

function setupDeleteAccount(token) {
  const deleteButton = document.getElementById("delete-account-btn");
  if (!deleteButton) return;

  deleteButton.addEventListener("click", async () => {
    try {
      await deleteUserByToken(token);
    } catch (err) {
      console.error("Delete account failed:", err);
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logout-button");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/index.html";
  });
}
