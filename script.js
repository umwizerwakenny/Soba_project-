
// ======================================
// SOBA WEBSITE - MAIN JAVASCRIPT
// ======================================

// MOBILE NAVIGATION
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    const icon = menuToggle.querySelector("i");

    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
});

// Close mobile menu after navigation
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");

        const icon = menuToggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
    });
});


// ======================================
// USER SESSION
// ======================================

const navActions = document.getElementById("navActions");

function updateNavigation() {

    const currentUser = JSON.parse(
        sessionStorage.getItem("sobaCurrentUser") || "null"
    );

    if (currentUser) {

        navActions.innerHTML = `
            <a href="dashboard.html" class="login-btn">
                <i class="fas fa-user-circle"></i>
                Dashboard
            </a>

            <button class="primary-btn" id="logoutBtn">
                Logout
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;

        document.getElementById("logoutBtn").addEventListener("click", logoutUser);

    } else {

        navActions.innerHTML = `
            <a href="login.html" class="login-btn">
                Login
            </a>

            <a href="register.html" class="primary-btn">
                Join SOBA
            </a>
        `;
    }
}


// LOGOUT
function logoutUser() {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (confirmLogout) {

        sessionStorage.removeItem("sobaCurrentUser");

        window.location.href = "index.html";
    }
}


// UPDATE NAVIGATION
updateNavigation();


// ======================================
// DEMO MODAL
// ======================================

const modal = document.getElementById("demoModal");

const modalTitle = document.getElementById("modalTitle");

const modalMessage = document.getElementById("modalMessage");

const modalClose = document.getElementById("modalClose");

const modalOkay = document.getElementById("modalOkay");


function openDemo(title, message) {

    modalTitle.textContent = title;

    modalMessage.textContent = message;

    modal.classList.add("active");
}


// CLOSE MODAL
modalClose.addEventListener("click", () => {
    modal.classList.remove("active");
});

modalOkay.addEventListener("click", () => {
    modal.classList.remove("active");
});

modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        modal.classList.remove("active");
    }

});

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        modal.classList.remove("active");
    }

});


// ======================================
// SOBA INITIALIZATION
// ======================================

console.log("SOBA website initialized successfully.");

console.log(
    "Current session:",
    sessionStorage.getItem("sobaCurrentUser")
);
