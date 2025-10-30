import { loadUserNameAndAvatar } from "../index.js";

let data = loadUserNameAndAvatar();

const username = document.createElement("h2");
username.textContent = `Hei ${data.username}!`;
document.getElementById("welcome-username").appendChild(username);

const email = document.createElement("p");
email.textContent = data.email;
document.getElementById("profile-email").appendChild(email);

const avatarImg = document.getElementById("profile-avatar");
const avatarImgNav = document.getElementById("profile-avatar-nav");
if (data.avatar) {
  avatarImg.src = `/uploads/${data.avatar}`;
  avatarImgNav.src = `/uploads/${data.avatar}`;
} else {
  avatarImg.src = "/public/avatar.png";
  avatarImgNav.src = "/public/avatar.png";
}
