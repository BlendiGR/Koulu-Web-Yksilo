import { verifyToken } from "../api/authApi.js";

const LOGIN_URL = "./login.html";

export async function ensureAuthenticated() {
  const userRaw = localStorage.getItem("user");

  if (!userRaw) {
    redirectToLogin();
    return null;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    localStorage.removeItem("user");
    redirectToLogin();
    return null;
  }

  if (!user || !user.token) {
    localStorage.removeItem("user");
    redirectToLogin();
    return null;
  }

  try {
    const freshUserData = await verifyToken(user.token);

    const updatedUser = {
      ...user,
      data: freshUserData,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (err) {
    console.error("authGuard error:", err);
    localStorage.removeItem("user");
    redirectToLogin();
    return null;
  }
}

function redirectToLogin() {
  window.location.href = LOGIN_URL;
}
