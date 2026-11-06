// SOBA MY PROFILE
// Frontend prototype using localStorage and sessionStorage.

const currentUser = JSON.parse(
    sessionStorage.getItem("sobaCurrentUser") || "null"
);

if (!currentUser) {
    window.location.href = "login.html";
}

const email = (currentUser?.email || "").toLowerCase();

const defaultProfile = {
    firstName: (currentUser?.fullName || "SOBA Member").split(" ")[0],
    lastName: (currentUser?.fullName || "").split(" ").slice(1).join(" "),
    bio: "Welcome to my SOBA profile. I am here to learn, share and grow.",
    location: "",
    profession: "",
    interests: "",
    avatar: "",
    cover: ""
};

function profileStorageKey() {
    return `sobaProfile_${email}`;
}

function readProfile() {
    try {
        const saved = JSON.parse(localStorage.getItem(profileStorageKey()) || "null");
        return { ...defaultProfile, ...(saved || {}) };
    } catch {
        return { ...defaultProfile };
    }
}

let profile = readProfile();

function saveProfile() {
    try {
        localStorage.setItem(profileStorageKey(), JSON.stringify(profile));
        return true;
    } catch {
        showToast("Storage is full. Try using a smaller image.");
        return false;
    }
}

function getFullName() {
    return `${profile.firstName} ${profile.lastName}`.trim();
}

function getInitials() {
    return getFullName().charAt(0).toUpperCase() || "S";
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return map[character];
    });
}

// USER PROFILE DISPLAY
function renderProfile() {
    const fullName = getFullName();
    const initials = getInitials();

    document.getElementById("displayName").textContent = fullName;
    document.getElementById("displayEmail").textContent = email || "Email not available";
    document.getElementById("displayRole").textContent =
        currentUser?.role
            ? `${currentUser.role.charAt(0).toUpperCase()}${currentUser.role.slice(1)} · SOBA Member`
            : "SOBA Community Member";

    document.getElementById("displayBio").textContent =
        profile.bio || "Welcome to my SOBA profile. I am here to learn, share and grow.";

    document.getElementById("displayLocation").textContent =
        profile.location || "Location not added";

    document.getElementById("profileInitial").textContent = initials;
    document.getElementById("topAvatar").textContent = initials;
    document.getElementById("createAvatar").textContent = initials;

    document.getElementById("aboutName").textContent = fullName;
    document.getElementById("aboutEmail").textContent = email || "Not added";
    document.getElementById("aboutLocation").textContent =
        profile.location || "Not added";
    document.getElementById("aboutProfession").textContent =
        profile.profession || "Not added";
    document.getElementById("aboutInterests").textContent =
        profile.interests || "Not added";

    const accounts = getAccounts();
    const account = accounts.find(item => item.email?.toLowerCase() === email);

    const joinedDate = account?.createdAt
        ? new Date(account.createdAt).toLocaleDateString()
        : "SOBA member";

    document.getElementById("joinDate").textContent = `Joined ${joinedDate}`;
    document.getElementById("aboutJoined").textContent = joinedDate;

    const picture = document.getElementById("profilePicture");

    if (profile.avatar) {
        picture.innerHTML = `<img src="${profile.avatar}" alt="Profile photo">`;
    } else {
        picture.innerHTML = `<span id="profileInitial">${escapeHTML(initials)}</span>`;
    }

    const cover = document.getElementById("coverPhoto");

    if (profile.cover) {
        cover.style.backgroundImage = `url("${profile.cover}")`;
    } else {
        cover.style.backgroundImage =
            `linear-gradient(120deg, rgba(16,43,63,.3), rgba(8,169,155,.2)), url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600")`;
    }

    document.getElementById("profileName").textContent = fullName;
}

// ACCOUNT DATA
function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem("sobaAccounts") || "[]");
    } catch {
        return [];
    }
}

// EDIT PROFILE
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editProfileForm");

function openEditModal() {
    document.getElementById("editFirstName").value = profile.firstName;
    document.getElementById("editLastName").value = profile.lastName;
    document.getElementById("editBio").value = profile.bio;
    document.getElementById("editLocation").value = profile.location;
    document.getElementById("editProfession").value = profile.profession;
    document.getElementById("editInterests").value = profile.interests;
    document.getElementById("editEmail").value = email;

    document.getElementById("editMessage").textContent = "";
    document.getElementById("editMessage").className = "edit-message";

    editModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeEditModal() {
    editModal.classList.remove("show");
    document.body.style.overflow = "";
}

document.getElementById("openEditButton").addEventListener("click", openEditModal);
document.getElementById("openEditButtonTwo").addEventListener("click", openEditModal);

document.getElementById("closeEditButton").addEventListener("click", closeEditModal);
document.getElementById("cancelEditButton").addEventListener("click", closeEditModal);

editModal.addEventListener("click", event => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

editForm.addEventListener("submit", event => {
    event.preventDefault();

    const firstName = document.getElementById("editFirstName").value.trim();
    const lastName = document.getElementById("editLastName").value.trim();

    if (!firstName || !lastName) {
        showEditMessage("First name and last name are required.", "error");
        return;
    }

    const oldProfile = { ...profile };

    profile = {
        ...profile,
        firstName,
        lastName,
        bio: document.getElementById("editBio").value.trim(),
        location: document.getElementById("editLocation").value.trim(),
        profession: document.getElementById("editProfession").value.trim(),
        interests: document.getElementById("editInterests").value.trim()
    };

    if (!saveProfile()) {
        profile = oldProfile;
        return;
    }

    // Update the current session name so the dashboard can use it too.
    const updatedSession = {
        ...currentUser,
        fullName: getFullName()
    };

    sessionStorage.setItem("sobaCurrentUser", JSON.stringify(updatedSession));

    // Also update the account name used by the demo registration system.
    const accounts = getAccounts();
    const accountIndex = accounts.findIndex(
        item => item.email?.toLowerCase() === email
    );

    if (accountIndex !== -1) {
        accounts[accountIndex].firstName = firstName;
        accounts[accountIndex].lastName = lastName;
        accounts[accountIndex].name = getFullName();

        try {
            localStorage.setItem("sobaAccounts", JSON.stringify(accounts));
        } catch {
            showToast("Profile saved, but account details could not be updated.");
        }
    }

    renderProfile();
    closeEditModal();
    showToast("Your profile has been updated.");
});

function showEditMessage(message, type) {
    const element = document.getElementById("editMessage");
    element.textContent = message;
    element.className = `edit-message ${type}`;
}

// PROFILE PHOTO
const avatarInput = document.getElementById("avatarInput");
const coverInput = document.getElementById("coverInput");

document.getElementById("changeAvatarButton").addEventListener("click", () => {
    avatarInput.click();
});

document.getElementById("changeCoverButton").addEventListener("click", () => {
    coverInput.click();
});

function readImageFile(file, callback) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        showToast("Choose a JPG, PNG or WEBP image.");
        return;
    }

    if (file.size > maxSize) {
        showToast("Image must be 2 MB or smaller.");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        callback(reader.result);
    };

    reader.onerror = () => {
        showToast("Unable to read this image.");
    };

    reader.readAsDataURL(file);
}

avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];

    readImageFile(file, imageData => {
        const previousImage = profile.avatar;
        profile.avatar = imageData;

        if (!saveProfile()) {
            profile.avatar = previousImage;
            return;
        }

        renderProfile();
        showToast("Profile photo updated.");
    });

    avatarInput.value = "";
});

coverInput.addEventListener("change", () => {
    const file = coverInput.files[0];

    readImageFile(file, imageData => {
        const previousImage = profile.cover;
        profile.cover = imageData;

        if (!saveProfile()) {
            profile.cover = previousImage;
            return;
        }

        renderProfile();
        showToast("Cover photo updated.");
    });

    coverInput.value = "";
});

// PROFILE TABS
document.querySelectorAll(".profile-tab").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".profile-tab").forEach(tab => {
            tab.classList.remove("active");
        });

        document.querySelectorAll(".tab-content").forEach(section => {
            section.classList.remove("active");
        });

        button.classList.add("active");

        const tabName = button.dataset.tab;
        document.getElementById(`${tabName}Tab`).classList.add("active");

        if (tabName === "photos") renderMyPhotos();
        if (tabName === "videos") renderMyVideos();
    });
});

// POSTS
function postsStorageKey() {
    return `sobaProfilePosts_${email}`;
}

function getMyPosts() {
    try {
        return JSON.parse(localStorage.getItem(postsStorageKey()) || "[]");
    } catch {
        return [];
    }
}

function saveMyPosts(posts) {
    try {
        localStorage.setItem(postsStorageKey(), JSON.stringify(posts));
        return true;
    } catch {
        showToast("Unable to save your post. Browser storage may be full.");
        return false;
    }
}

function renderMyPosts() {
    const posts = getMyPosts();
    const container = document.getElementById("myPosts");

    document.getElementById("postCount").textContent = posts.length;

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-profile-state">
                <div class="empty-icon">
                    <i class="fa-regular fa-newspaper"></i>
                </div>
                <h3>Your story starts here</h3>
                <p>Posts you share on SOBA will appear on your profile.</p>
                <button class="primary-button" id="firstPostButton">
                    <i class="fa-solid fa-plus"></i> Create your first post
                </button>
            </div>
        `;

        document.getElementById("firstPostButton").addEventListener(
            "click",
            openPostModal
        );

        return;
    }

    container.innerHTML = posts.map(post => `
        <article class="post-card">
            <div class="post-header">
                <div class="post-avatar">${escapeHTML(getInitials())}</div>
                <div>
                    <p class="post-author">${escapeHTML(getFullName())}</p>
                    <p class="post-date">${escapeHTML(new Date(post.date).toLocaleString())}</p>
                </div>
            </div>

            <p class="post-text">${escapeHTML(post.text)}</p>

            <div class="post-footer">
                <span><i class="fa-regular fa-heart"></i> SOBA Post</span>
                <span><i class="fa-regular fa-comment"></i> Community update</span>
            </div>
        </article>
    `).join("");
}

// POST MODAL
const postModal = document.getElementById("postModal");

function openPostModal() {
    postModal.classList.add("show");
    document.body.style.overflow = "hidden";
    document.getElementById("postText").focus();
}

function closePostModal() {
    postModal.classList.remove("show");
    document.body.style.overflow = "";
}

document.getElementById("createPostButton").addEventListener("click", openPostModal);

document.getElementById("closePostButton").addEventListener("click", closePostModal);
document.getElementById("cancelPostButton").addEventListener("click", closePostModal);

postModal.addEventListener("click", event => {
    if (event.target === postModal) {
        closePostModal();
    }
});

document.getElementById("createPostForm").addEventListener("submit", event => {
    event.preventDefault();

    const text = document.getElementById("postText").value.trim();

    if (!text) {
        showPostMessage("Please write something before publishing.", "error");
        return;
    }

    const posts = getMyPosts();

    posts.unshift({
        id: Date.now(),
        text,
        date: new Date().toISOString()
    });

    if (!saveMyPosts(posts)) return;

    document.getElementById("createPostForm").reset();
    closePostModal();
    renderMyPosts();
    showToast("Your post has been published on your profile.");
});

function showPostMessage(message, type) {
    const element = document.getElementById("postMessage");
    element.textContent = message;
    element.className = `edit-message ${type}`;
}

// PHOTOS
function renderMyPhotos() {
    const container = document.getElementById("myPhotos");

    // Photos uploaded through the SOBA Photos page.
    let photos = [];

    try {
        photos = JSON.parse(localStorage.getItem("sobaCommunityPhotos") || "[]");
    } catch {
        photos = [];
    }

    const myPhotos = photos.filter(photo => {
        return photo.userCreated &&
            (photo.ownerEmail || "").toLowerCase() === email;
    });

    document.getElementById("photoCount").textContent = myPhotos.length;

    if (myPhotos.length === 0) {
        container.innerHTML = `
            <div class="empty-profile-state">
                <div class="empty-icon"><i class="fa-regular fa-images"></i></div>
                <h3>No photos to show</h3>
                <p>Your shared photos will appear here when available.</p>
                <a href="photos.html" class="primary-button">Explore Photos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = myPhotos.map(photo => `
        <div class="media-item">
            <img src="${escapeHTML(photo.image || photo.imageUrl || "")}" alt="${escapeHTML(photo.title || "My photo")}">
            <p>${escapeHTML(photo.title || "My photo")}</p>
        </div>
    `).join("");
}

// VIDEOS
function renderMyVideos() {
    const container = document.getElementById("myVideos");

    // Videos uploaded on the Videos page are currently kept in page memory,
    // so they are not permanently available to this profile page.
    container.innerHTML = `
        <div class="empty-profile-state">
            <div class="empty-icon"><i class="fa-solid fa-circle-play"></i></div>
            <h3>Your video collection</h3>
            <p>Videos shared from this browser session may not be available after leaving the Videos page. A shared database will connect these pages in the full version.</p>
            <a href="videos.html" class="primary-button">Explore Videos</a>
        </div>
    `;

    document.getElementById("videoCount").textContent = "0";
}

// SHARE PROFILE
document.getElementById("shareProfileButton").addEventListener("click", async () => {
    const profileLink = window.location.href;
    const shareData = {
        title: `${getFullName()} | SOBA`,
        text: `Visit ${getFullName()}'s SOBA profile.`,
        url: profileLink
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(profileLink);
            showToast("Profile link copied.");
        } else {
            showToast("Sharing is not supported in this browser.");
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            showToast("Unable to share profile.");
        }
    }
});

// PROFILE MENU
document.getElementById("userMenuButton").addEventListener("click", () => {
    document.getElementById("dropdownMenu").classList.toggle("show");
});

document.addEventListener("click", event => {
    const dropdown = document.querySelector(".profile-dropdown");

    if (!dropdown.contains(event.target)) {
        document.getElementById("dropdownMenu").classList.remove("show");
    }
});

// LOG OUT
document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("sobaCurrentUser");
    window.location.href = "login.html";
});

// SEARCH
document.getElementById("profileSearch").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        const query = event.target.value.trim();

        if (query) {
            window.location.href = `dashboard.html?search=${encodeURIComponent(query)}`;
        }
    }
});

// TOAST
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

// CLOSE MODALS WITH ESCAPE
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        if (editModal.classList.contains("show")) {
            closeEditModal();
        }

        if (postModal.classList.contains("show")) {
            closePostModal();
        }
    }
});

// INITIAL PAGE LOAD
renderProfile();
renderMyPosts();
renderMyPhotos();
renderMyVideos();