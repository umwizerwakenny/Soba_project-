
const currentUser = JSON.parse(
    sessionStorage.getItem("sobaCurrentUser") || "null"
);

if (!currentUser) {
    window.location.replace("login.html");
}

const myName = currentUser?.fullName || "SOBA Member";
document.getElementById("sidebarUser").textContent = myName;

const photoGrid = document.getElementById("photoGrid");
const emptyGallery = document.getElementById("emptyGallery");
const uploadModal = document.getElementById("uploadModal");
const photoViewer = document.getElementById("photoViewer");
const photoForm = document.getElementById("photoForm");
const photoFile = document.getElementById("photoFile");
const imagePreview = document.getElementById("imagePreview");
const toast = document.getElementById("photoToast");

let selectedCategory = "all";
let selectedPhotoIndex = 0;
let previewURL = null;

const samplePhotos = [
    {
        id: 1,
        title: "A peaceful morning",
        description: "Finding inspiration in the beauty of nature.",
        category: "nature",
        creator: "SOBA Community",
        initials: "SC",
        color: "#279e91",
        image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=700",
        likes: 24,
        liked: false,
        date: 6
    },
    {
        id: 2,
        title: "The beauty of creativity",
        description: "Art is another language through which we express ideas.",
        category: "creativity",
        creator: "Creative Minds",
        initials: "CM",
        color: "#9a78af",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700",
        likes: 37,
        liked: false,
        date: 5
    },
    {
        id: 3,
        title: "Learning together",
        description: "Knowledge becomes more powerful when shared.",
        category: "learning",
        creator: "Learning Circle",
        initials: "LC",
        color: "#5283b2",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700",
        likes: 18,
        liked: false,
        date: 4
    },
    {
        id: 4,
        title: "A world of possibilities",
        description: "Discovering beautiful places and new perspectives.",
        category: "nature",
        creator: "Aline Uwase",
        initials: "AU",
        color: "#bd777d",
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700",
        likes: 42,
        liked: false,
        date: 3
    },
    {
        id: 5,
        title: "Community in action",
        description: "Positive change starts when people work together.",
        category: "community",
        creator: "Youth Circle",
        initials: "YC",
        color: "#b28a53",
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=700",
        likes: 29,
        liked: false,
        date: 2
    },
    {
        id: 6,
        title: "Everyday inspiration",
        description: "Small moments can carry meaningful stories.",
        category: "lifestyle",
        creator: "Diane Mukamana",
        initials: "DM",
        color: "#4c91a0",
        image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=700",
        likes: 15,
        liked: false,
        date: 1
    }
];

let photos = [...samplePhotos];

try {
    const savedPhotos = JSON.parse(
        localStorage.getItem("sobaCommunityPhotos") || "[]"
    );

    if (Array.isArray(savedPhotos)) {
        photos = [...savedPhotos, ...photos];
    }
} catch (error) {
    console.warn("Could not load community photos.");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function savePhotos() {
    const userPhotos = photos.filter(photo => photo.userCreated);

    try {
        localStorage.setItem(
            "sobaCommunityPhotos",
            JSON.stringify(userPhotos)
        );
    } catch (error) {
        showToast("Storage is full. Please use a smaller photo.");
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function renderPhotos() {
    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    let visiblePhotos = photos.filter(photo => {
        const matchesCategory =
            selectedCategory === "all" ||
            photo.category === selectedCategory;

        const matchesSearch =
            photo.title.toLowerCase().includes(search) ||
            photo.description.toLowerCase().includes(search) ||
            photo.creator.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
    });

    if (document.getElementById("sortPhotos").value === "popular") {
        visiblePhotos.sort((a, b) => b.likes - a.likes);
    } else {
        visiblePhotos.sort((a, b) => b.date - a.date);
    }

    photoGrid.innerHTML = "";

    emptyGallery.hidden = visiblePhotos.length !== 0;

    visiblePhotos.forEach(photo => {
        const card = document.createElement("article");
        card.className = "photo-card";

        const imageWrap = document.createElement("div");
        imageWrap.className = "photo-image-wrap";

        const image = document.createElement("img");
        image.src = photo.image;
        image.alt = photo.title;
        image.loading = "lazy";

        image.addEventListener("click", () => {
            openViewer(photo.id);
        });

        const category = document.createElement("span");
        category.className = "photo-category-label";
        category.textContent = photo.category;

        imageWrap.append(image, category);

        const info = document.createElement("div");
        info.className = "photo-card-info";

        const title = document.createElement("h3");
        title.textContent = photo.title;

        const description = document.createElement("p");
        description.textContent = photo.description;

        const bottom = document.createElement("div");
        bottom.className = "photo-card-bottom";

        const creator = document.createElement("div");
        creator.className = "creator-info";

        const avatar = document.createElement("span");
        avatar.className = "creator-avatar";
        avatar.style.background = photo.color;
        avatar.textContent = photo.initials;

        const creatorName = document.createElement("span");
        creatorName.textContent = photo.creator;

        creator.append(avatar, creatorName);

        const actions = document.createElement("div");
        actions.className = "photo-actions";

        const likeButton = document.createElement("button");
        likeButton.className = photo.liked ? "liked" : "";
        likeButton.innerHTML = `
            <i class="${photo.liked ? "fa-solid" : "fa-regular"} fa-heart"></i>
            ${photo.likes}
        `;

        likeButton.addEventListener("click", () => {
            photo.liked = !photo.liked;
            photo.likes += photo.liked ? 1 : -1;
            savePhotos();
            renderPhotos();
        });

        const viewButton = document.createElement("button");
        viewButton.innerHTML = `<i class="fa-regular fa-eye"></i> View`;

        viewButton.addEventListener("click", () => {
            openViewer(photo.id);
        });

        actions.append(likeButton, viewButton);
        bottom.append(creator, actions);
        info.append(title, description, bottom);
        card.append(imageWrap, info);

        photoGrid.appendChild(card);
    });
}

// Category filters
document.querySelectorAll(".category-chip").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category-chip").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        selectedCategory = button.dataset.category;
        renderPhotos();
    });
});

// Search
document.getElementById("searchInput").addEventListener("input", renderPhotos);

document.getElementById("sortPhotos").addEventListener("change", renderPhotos);

document.getElementById("searchToggle").addEventListener("click", () => {
    document.getElementById("photoSearch").classList.toggle("show");

    if (document.getElementById("photoSearch").classList.contains("show")) {
        document.getElementById("searchInput").focus();
    }
});

// Explore button
document.getElementById("explorePhotos").addEventListener("click", () => {
    document.getElementById("gallerySection").scrollIntoView({
        behavior: "smooth"
    });
});

// Upload modal
document.getElementById("openUpload").addEventListener("click", () => {
    uploadModal.classList.add("show");
});

document.getElementById("closeUpload").addEventListener("click", closeUpload);

uploadModal.addEventListener("click", event => {
    if (event.target === uploadModal) closeUpload();
});

function closeUpload() {
    uploadModal.classList.remove("show");
    photoForm.reset();

    imagePreview.hidden = true;
    imagePreview.removeAttribute("src");

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }
}

// Image preview and validation
photoFile.addEventListener("change", () => {
    const file = photoFile.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        showToast("Please select a JPG, PNG or WEBP image.");
        photoFile.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast("Photo must be smaller than 5 MB.");
        photoFile.value = "";
        return;
    }

    if (previewURL) URL.revokeObjectURL(previewURL);

    previewURL = URL.createObjectURL(file);
    imagePreview.src = previewURL;
    imagePreview.hidden = false;
});

// Publish photo
photoForm.addEventListener("submit", event => {
    event.preventDefault();

    const file = photoFile.files[0];

    if (!file) {
        showToast("Please choose a photo first.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast("Photo must be smaller than 5 MB.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {
        const photo = {
            id: Date.now(),
            title: document.getElementById("photoTitle").value.trim(),
            category: document.getElementById("photoCategory").value,
            description: document.getElementById("photoDescription").value.trim() ||
                "A moment shared with the SOBA community.",
            creator: myName,
            initials: myName.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase(),
            color: "#079b91",
            image: reader.result,
            likes: 0,
            liked: false,
            date: Date.now(),
            userCreated: true
        };

        photos.unshift(photo);

        try {
            savePhotos();
        } catch (error) {
            photos = photos.filter(item => item.id !== photo.id);
            showToast("Unable to save this photo. Try a smaller image.");
            return;
        }

        selectedCategory = "all";

        document.querySelectorAll(".category-chip").forEach(button => {
            button.classList.toggle("active", button.dataset.category === "all");
        });

        document.getElementById("searchInput").value = "";

        renderPhotos();
        closeUpload();

        showToast("Your photo has been added to the SOBA collection.");
    };

    reader.onerror = () => {
        showToast("Unable to read this image.");
    };

    reader.readAsDataURL(file);
});

// Photo viewer
function openViewer(id) {
    selectedPhotoIndex = photos.findIndex(photo => photo.id === id);

    if (selectedPhotoIndex < 0) return;

    renderViewer();
    photoViewer.classList.add("show");
}

function renderViewer() {
    const photo = photos[selectedPhotoIndex];

    document.getElementById("viewerContent").innerHTML = `
        <img src="${escapeHTML(photo.image)}" alt="${escapeHTML(photo.title)}">
        <h3>${escapeHTML(photo.title)}</h3>
        <p>${escapeHTML(photo.description)}</p>
        <small>${escapeHTML(photo.creator)} · ${photo.likes} appreciations</small>
    `;
}

document.getElementById("closeViewer").addEventListener("click", () => {
    photoViewer.classList.remove("show");
});

photoViewer.addEventListener("click", event => {
    if (event.target === photoViewer) {
        photoViewer.classList.remove("show");
    }
});

document.getElementById("prevPhoto").addEventListener("click", () => {
    selectedPhotoIndex =
        (selectedPhotoIndex - 1 + photos.length) % photos.length;
    renderViewer();
});

document.getElementById("nextPhoto").addEventListener("click", () => {
    selectedPhotoIndex =
        (selectedPhotoIndex + 1) % photos.length;
    renderViewer();
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("sobaCurrentUser");
    window.location.href = "login.html";
});

// First render
renderPhotos();
