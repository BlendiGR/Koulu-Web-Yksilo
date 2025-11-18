const raw = localStorage.getItem("user");
const userData = JSON.parse(raw);
const token = userData.token;

const username = document.createElement("h2");
username.textContent = `Hei ${userData.data.username}!`;
document.getElementById("welcome-username").appendChild(username);

const email = document.createElement("p");
email.textContent = userData.data.email;
document.getElementById("profile-email").appendChild(email);

const avatarImg = document.getElementById("profile-avatar");
const avatarImgNav = document.getElementById("profile-avatar-nav");
if (userData.data.avatar) {
  const url = `http://media2.edu.metropolia.fi/restaurant/uploads/${encodeURIComponent(
    userData.data.avatar
  )}`;
  avatarImg.src = url;
  avatarImgNav.src = url;
} else {
  avatarImg.src = "/public/avatar.jpg";
  avatarImgNav.src = "/public/avatar.jpg";
}

//Change Avatar

const form = document.getElementById("avatar-change");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users/avatar",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();
    console.log("Avatar uploaded successfully", data);
  } catch (err) {
    console.error(err);
    return;
  }

  try {
    const res = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users/token",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch fresh user data");

    const freshUserData = await res.json();

    userData.data = freshUserData;

    localStorage.setItem("user", JSON.stringify(userData));

    if (freshUserData.avatar) {
      const baseUrl = "https://media2.edu.metropolia.fi/restaurant/uploads/";
      const avatarUrl = `${baseUrl}${encodeURIComponent(
        freshUserData.avatar
      )}?t=${Date.now()}`;

      avatarImg.src = avatarUrl;
      avatarImgNav.src = avatarUrl;
    }
  } catch (err) {
    console.error("profile update error:", err);
    localStorage.removeItem("user");
    window.location.href = LOGIN_URL;
  }
});

const deleteButton = document.getElementById("delete-account-btn");

deleteButton.addEventListener("click", async () => {
  const response = await fetch(
    `https://media2.edu.metropolia.fi/restaurant/api/v1/${encodeURIComponent(
      token
    )}`
  );
  if (!response.ok) {
  }
});
