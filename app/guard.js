(async () => {
  const LOGIN_URL = "/login_page/index.html";

  const userRaw = localStorage.getItem("user");
  if (!userRaw) {
    window.location.href = LOGIN_URL;
    return;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    localStorage.removeItem("user");
    window.location.href = LOGIN_URL;
    return;
  }

  if (!user || !user.token) {
    localStorage.removeItem("user");
    window.location.href = LOGIN_URL;
    return;
  }

  try {
    const res = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users/token",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    if (!res.ok) {
      localStorage.removeItem("user");
      window.location.href = LOGIN_URL;
      return;
    }

    const freshUserData = await res.json();

    const updatedUser = {
      ...user,
      data: freshUserData,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  } catch (err) {
    console.error("guard.js error:", err);
    localStorage.removeItem("user");
    window.location.href = LOGIN_URL;
  }
})();
