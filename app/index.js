import "./components_authed/map.js";
import "./components_authed/restaurantCards.js";

const userRaw = localStorage.getItem("user");
export const userData = JSON.parse(userRaw);
console.log(userData);

const profilePic = () => {
  const avatarImgNav = document.getElementById("profile-avatar-nav");
  if (userData.data.avatar) {
    avatarImgNav.src = `http://media2.edu.metropolia.fi/restaurant/uploads/${encodeURIComponent(
      userData.data.avatar
    )}`;
  } else {
    avatarImgNav.src = "/public/avatar.jpg";
  }
};

profilePic();
