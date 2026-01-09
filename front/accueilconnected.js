const cookieBanner = document.getElementById("cookie-banner");
const acceptBtn = document.getElementById("accept-cookies");

// Si l'utilisateur n'a pas encore accepté les cookies, on affiche le bandeau
if (!localStorage.getItem("cookiesAccepted")) {
  cookieBanner.style.display = "flex";
}

// Quand il clique sur "Accepter"
acceptBtn.addEventListener("click", () => {
  localStorage.setItem("cookiesAccepted", "true");
  cookieBanner.style.display = "none";
});



const toggle = document.getElementById("toogle");
const navbar = document.getElementById("navbar");

toggle.addEventListener("click", () => {
  navbar.classList.toggle("active");
});
