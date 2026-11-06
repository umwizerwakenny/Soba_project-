
// SOBA LOGIN SYSTEM

const loginForm = document.getElementById("loginForm");
const alertMessage = document.getElementById("alertMessage");

function showMessage(message, type) {
    if (!alertMessage) return;

    alertMessage.textContent = message;
    alertMessage.className = `alert-message show ${type}`;
}

// Automatically fill email received from register page
const urlParams = new URLSearchParams(window.location.search);
const registeredEmail = urlParams.get("email");

if (registeredEmail) {
    document.getElementById("loginEmail").value = registeredEmail;
}

// Password visibility
document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", function () {
        const input = document.getElementById(this.dataset.target);
        const icon = this.querySelector("i");

        if (!input) return;

        if (input.type === "password") {
            input.type = "text";
            if (icon) {
                icon.classList.replace("fa-eye", "fa-eye-slash");
            }
        } else {
            input.type = "password";
            if (icon) {
                icon.classList.replace("fa-eye-slash", "fa-eye");
            }
        }
    });
});

// Login process
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    let accounts = [];

    try {
        accounts = JSON.parse(
            localStorage.getItem("sobaAccounts") || "[]"
        );

        if (!Array.isArray(accounts)) {
            accounts = [];
        }
    } catch (error) {
        showMessage("Unable to read registered accounts.", "error");
        return;
    }

    const account = accounts.find(user =>
        user.email &&
        user.email.toLowerCase() === email &&
        user.password === password
    );

    if (!account) {
        showMessage(
            "Invalid email or password. Please try again.",
            "error"
        );
        return;
    }

    // Save current user without storing the password
    const loggedInUser = {
        firstName: account.firstName || "",
        lastName: account.lastName || "",
        fullName: account.name ||
            `${account.firstName || ""} ${account.lastName || ""}`.trim(),
        email: account.email,
        role: account.role || "member"
    };

    sessionStorage.setItem(
        "sobaCurrentUser",
        JSON.stringify(loggedInUser)
    );

    showMessage(
        "Login successful! Opening your SOBA dashboard...",
        "success"
    );

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 800);
});

// Forgot password demo message
const forgotBtn = document.getElementById("forgotBtn");

if (forgotBtn) {
    forgotBtn.addEventListener("click", function () {
        showMessage(
            "Password recovery will be available in a future SOBA update.",
            "info"
        );
    });
}
