
const registerForm = document.getElementById("registerForm");
const alertMessage = document.getElementById("alertMessage");

function showMessage(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert-message show ${type}`;
}

document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        const icon = button.querySelector("i");

        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
});

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const gender = document.getElementById("gender").value;
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const accepted = document.getElementById("acceptTerms").checked;

    if (!firstName || !lastName || !email || !phone || !gender || !role) {
        return showMessage("Please complete all required fields.", "error");
    }

    if (password.length < 8) {
        return showMessage("Password must contain at least 8 characters.", "error");
    }

    if (password !== confirmPassword) {
        return showMessage("Passwords do not match. Please try again.", "error");
    }

    if (!accepted) {
        return showMessage("Please accept the demo terms and conditions.", "error");
    }

    // Retrieve existing demo accounts
    const accounts = JSON.parse(
        localStorage.getItem("sobaAccounts") || "[]"
    );

    // Check duplicate email
    const existingAccount = accounts.find(account => account.email === email);

    if (existingAccount) {
        return showMessage("This email is already registered. Please sign in.", "error");
    }

    // Create demo account
    const newAccount = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        gender,
        role,
        password,
        createdAt: new Date().toISOString()
    };

    accounts.push(newAccount);

    localStorage.setItem("sobaAccounts", JSON.stringify(accounts));

    showMessage(
        "Registration successful! Redirecting you to Login...",
        "success"
    );

    registerForm.reset();

    setTimeout(() => {
        window.location.href = `login.html?email=${encodeURIComponent(email)}`;
    }, 1500);
});
