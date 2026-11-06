// SOBA VIDEOS PAGE
// Frontend prototype: videos uploaded here remain available only
// until this browser page is refreshed or closed.

const currentUser = JSON.parse(
    sessionStorage.getItem("sobaCurrentUser") || "null"
);

if (!currentUser) {
    window.location.href = "login.html";
}

const userName = currentUser?.fullName || "SOBA Member";
const userInitial = userName.charAt(0).toUpperCase();

document.getElementById("userInitial").textContent = userInitial;
document.getElementById("profileName").textContent = userName;

// Public sample video used for demonstration previews.
// Replace these sample URLs with your own approved video sources later.
const demoVideoUrl =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const sampleVideos = [
    {
        id: "sample-1",
        title: "Why education is important for our future",
        description: "A short educational demonstration about the value of learning and developing useful knowledge.",
        category: "Education",
        creator: "SOBA Learning",
        initials: "SL",
        views: "1.2K",
        date: "2026-10-28",
        duration: "Demo",
        thumbnail: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900",
        videoUrl: demoVideoUrl,
        likes: 42,
        comments: 8,
        demo: true
    },
    {
        id: "sample-2",
        title: "Discovering the world of technology",
        description: "Explore how technology can support creativity, learning and problem-solving.",
        category: "Technology",
        creator: "Digital Skills Hub",
        initials: "DH",
        views: "980",
        date: "2026-10-25",
        duration: "Demo",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900",
        videoUrl: demoVideoUrl,
        likes: 36,
        comments: 5,
        demo: true
    },
    {
        id: "sample-3",
        title: "Building positive habits every day",
        description: "A community learning example about planning, consistency and personal development.",
        category: "Life Skills",
        creator: "Grow Together",
        initials: "GT",
        views: "2.1K",
        date: "2026-10-22",
        duration: "Demo",
        thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=900",
        videoUrl: demoVideoUrl,
        likes: 78,
        comments: 12,
        demo: true
    },
    {
        id: "sample-4",
        title: "Working together to improve our community",
        description: "An example of community cooperation, volunteering and sharing useful ideas.",
        category: "Community",
        creator: "Community Voices",
        initials: "CV",
        views: "760",
        date: "2026-10-19",
        duration: "Demo",
        thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900",
        videoUrl: demoVideoUrl,
        likes: 29,
        comments: 4,
        demo: true
    },
    {
        id: "sample-5",
        title: "Stay curious and keep learning",
        description: "A positive message encouraging young people to explore knowledge and develop their abilities.",
        category: "Motivation",
        creator: "SOBA Inspiration",
        initials: "SI",
        views: "3.4K",
        date: "2026-10-15",
        duration: "Demo",
        thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=900",
        videoUrl: demoVideoUrl,
        likes: 105,
        comments: 17,
        demo: true
    },
    {
        id: "sample-6",
        title: "Preparing for your future career",
        description: "An introduction to career planning, discovering interests and building practical skills.",
        category: "Career",
        creator: "Future Path",
        initials: "FP",
        views: "1.5K",
        date: "2026-10-10",
        duration: "Demo",
        thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900",
        videoUrl: demoVideoUrl,
        likes: 61,
        comments: 9,
        demo: true
    }
];

let uploadedVideos = [];
let activeCategory = "All";
let selectedFile = null;
let selectedObjectUrl = null;
let activePlayerUrl = null;

const videoGrid = document.getElementById("videoGrid");
const videoCount = document.getElementById("videoCount");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("videoSearch");
const sortSelect = document.getElementById("sortVideos");

const uploadModal = document.getElementById("uploadModal");
const uploadForm = document.getElementById("uploadForm");
const videoFileInput = document.getElementById("videoFile");
const fileLabel = document.getElementById("fileLabel");
const uploadPreview = document.getElementById("uploadPreview");
const previewVideo = document.getElementById("previewVideo");
const formMessage = document.getElementById("formMessage");

const playerModal = document.getElementById("playerModal");
const mainVideoPlayer = document.getElementById("mainVideoPlayer");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

function getAllVideos() {
    return [...uploadedVideos, ...sampleVideos];
}

function getLikeStorage() {
    try {
        return JSON.parse(localStorage.getItem("sobaVideoLikes") || "{}");
    } catch {
        return {};
    }
}

function saveLikeStorage(data) {
    try {
        localStorage.setItem("sobaVideoLikes", JSON.stringify(data));
    } catch {
        showToast("Your browser could not save this preference.");
    }
}

function getCommentStorage() {
    try {
        return JSON.parse(localStorage.getItem("sobaVideoComments") || "{}");
    } catch {
        return {};
    }
}

function saveCommentStorage(data) {
    try {
        localStorage.setItem("sobaVideoComments", JSON.stringify(data));
    } catch {
        showToast("Your browser could not save this comment.");
    }
}

function renderVideos() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const sortMode = sortSelect.value;
    const likedVideos = getLikeStorage();
    const comments = getCommentStorage();

    let videos = getAllVideos();

    if (activeCategory !== "All") {
        videos = videos.filter(video => video.category === activeCategory);
    }

    if (searchTerm) {
        videos = videos.filter(video => {
            const searchableText = [
                video.title,
                video.description,
                video.category,
                video.creator
            ].join(" ").toLowerCase();

            return searchableText.includes(searchTerm);
        });
    }

    if (sortMode === "popular") {
        videos.sort((a, b) => {
            const likesA = a.likes + (likedVideos[a.id] ? 1 : 0);
            const likesB = b.likes + (likedVideos[b.id] ? 1 : 0);
            return likesB - likesA;
        });
    } else {
        videos.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    videoCount.textContent = `${videos.length} ${videos.length === 1 ? "video" : "videos"}`;

    if (videos.length === 0) {
        videoGrid.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    videoGrid.innerHTML = videos.map(video => {
        const isLiked = Boolean(likedVideos[video.id]);
        const commentCount = video.comments + (comments[video.id]?.length || 0);

        return `
            <article class="video-card">
                <div class="video-thumbnail" data-play="${escapeHTML(video.id)}">
                    <img
                        src="${escapeHTML(video.thumbnail)}"
                        alt="${escapeHTML(video.title)}"
                        loading="lazy"
                    >
                    <div class="thumbnail-overlay">
                        <span class="play-button">
                            <i class="fa-solid fa-play"></i>
                        </span>
                    </div>
                    <span class="video-duration">${escapeHTML(video.duration || "Video")}</span>
                </div>

                <div class="video-card-body">
                    <span class="video-category">${escapeHTML(video.category)}</span>

                    <h3 class="video-title">${escapeHTML(video.title)}</h3>
                    <p class="video-description">${escapeHTML(video.description)}</p>

                    <div class="creator-row">
                        <span class="creator-avatar">${escapeHTML(video.initials)}</span>
                        <div class="creator-info">
                            <p class="creator-name">${escapeHTML(video.creator)}</p>
                            <p class="video-meta">${escapeHTML(video.views || "New")} views · ${escapeHTML(video.date)}</p>
                        </div>
                    </div>

                    <div class="video-actions">
                        <button
                            class="video-action ${isLiked ? "liked" : ""}"
                            data-like="${escapeHTML(video.id)}"
                            aria-label="Like video"
                        >
                            <i class="${isLiked ? "fa-solid" : "fa-regular"} fa-heart"></i>
                            ${video.likes + (isLiked ? 1 : 0)}
                        </button>

                        <button
                            class="video-action"
                            data-comment="${escapeHTML(video.id)}"
                            aria-label="Comment on video"
                        >
                            <i class="fa-regular fa-comment"></i>
                            ${commentCount}
                        </button>

                        <button
                            class="video-action"
                            data-share="${escapeHTML(video.id)}"
                            aria-label="Share video"
                        >
                            <i class="fa-solid fa-share-nodes"></i>
                            Share
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

// Category filters
document.querySelectorAll(".category-chip").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category-chip").forEach(chip => {
            chip.classList.remove("active");
        });

        button.classList.add("active");
        activeCategory = button.dataset.category;
        renderVideos();
    });
});

// Search and sorting
searchInput.addEventListener("input", renderVideos);
sortSelect.addEventListener("change", renderVideos);

// Video card actions
videoGrid.addEventListener("click", async event => {
    const playButton = event.target.closest("[data-play]");
    const likeButton = event.target.closest("[data-like]");
    const commentButton = event.target.closest("[data-comment]");
    const shareButton = event.target.closest("[data-share]");

    if (playButton) {
        openVideo(playButton.dataset.play);
        return;
    }

    if (likeButton) {
        toggleLike(likeButton.dataset.like);
        return;
    }

    if (commentButton) {
        addComment(commentButton.dataset.comment);
        return;
    }

    if (shareButton) {
        await shareVideo(shareButton.dataset.share);
    }
});

function toggleLike(videoId) {
    const likes = getLikeStorage();
    likes[videoId] = !likes[videoId];
    saveLikeStorage(likes);
    renderVideos();
}

function addComment(videoId) {
    const comment = window.prompt("Write a respectful comment:");

    if (comment === null) return;

    const cleanComment = comment.trim();

    if (!cleanComment) {
        showToast("Please write a comment first.");
        return;
    }

    const comments = getCommentStorage();

    if (!Array.isArray(comments[videoId])) {
        comments[videoId] = [];
    }

    comments[videoId].push({
        name: userName,
        text: cleanComment,
        date: new Date().toISOString()
    });

    saveCommentStorage(comments);
    renderVideos();
    showToast("Your comment was added.");
}

async function shareVideo(videoId) {
    const video = getAllVideos().find(item => item.id === videoId);

    if (!video) return;

    const shareText = `Watch "${video.title}" on SOBA.`;

    try {
        if (navigator.share) {
            await navigator.share({
                title: video.title,
                text: shareText,
                url: window.location.href
            });
        } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(
                `${shareText} ${window.location.href}`
            );
            showToast("Share text copied.");
        } else {
            showToast("Sharing is not supported in this browser.");
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            showToast("Unable to share this video.");
        }
    }
}

// Video player
function openVideo(videoId) {
    const video = getAllVideos().find(item => item.id === videoId);

    if (!video) return;

    activePlayerUrl = video.videoUrl;
    mainVideoPlayer.src = activePlayerUrl;

    document.getElementById("playerTitle").textContent = video.title;
    document.getElementById("playerDescription").textContent = video.description;
    document.getElementById("playerAuthor").textContent =
        `Shared by ${video.creator} · ${video.category}`;

    playerModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    mainVideoPlayer.load();

    mainVideoPlayer.play().catch(() => {
        // The visitor can press play manually if autoplay is blocked.
    });
}

function closeVideoPlayer() {
    mainVideoPlayer.pause();
    mainVideoPlayer.removeAttribute("src");
    mainVideoPlayer.load();

    playerModal.classList.add("hidden");
    document.body.style.overflow = "";
    activePlayerUrl = null;
}

document.getElementById("closePlayer").addEventListener("click", closeVideoPlayer);

playerModal.addEventListener("click", event => {
    if (event.target === playerModal) {
        closeVideoPlayer();
    }
});

// Upload modal
function openUploadModal() {
    uploadModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeUploadModal() {
    uploadModal.classList.remove("show");

    if (playerModal.classList.contains("hidden")) {
        document.body.style.overflow = "";
    }
}

document.getElementById("uploadTopButton").addEventListener("click", openUploadModal);
document.getElementById("heroUploadButton").addEventListener("click", openUploadModal);
document.getElementById("closeUploadModal").addEventListener("click", closeUploadModal);

uploadModal.addEventListener("click", event => {
    if (event.target === uploadModal) {
        closeUploadModal();
    }
});

// Select and preview uploaded video
videoFileInput.addEventListener("change", () => {
    const file = videoFileInput.files[0];

    if (!file) return;

    const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg"
    ];

    const maxSize = 50 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        showFormMessage("Please choose an MP4, WEBM or OGG video.", "error");
        videoFileInput.value = "";
        return;
    }

    if (file.size > maxSize) {
        showFormMessage("The video must be 50 MB or smaller.", "error");
        videoFileInput.value = "";
        return;
    }

    if (selectedObjectUrl) {
        URL.revokeObjectURL(selectedObjectUrl);
    }

    selectedFile = file;
    selectedObjectUrl = URL.createObjectURL(file);

    previewVideo.src = selectedObjectUrl;
    uploadPreview.classList.remove("hidden");
    fileLabel.textContent = file.name;
    formMessage.textContent = "";
    formMessage.className = "form-message";
});

document.getElementById("removeVideo").addEventListener("click", () => {
    clearSelectedVideo();
});

function clearSelectedVideo() {
    if (selectedObjectUrl) {
        URL.revokeObjectURL(selectedObjectUrl);
    }

    selectedFile = null;
    selectedObjectUrl = null;

    previewVideo.removeAttribute("src");
    previewVideo.load();

    videoFileInput.value = "";
    fileLabel.textContent = "Choose a video from your device";
    uploadPreview.classList.add("hidden");
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

// Publish uploaded video
uploadForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("videoTitle").value.trim();
    const description = document.getElementById("videoDescription").value.trim();
    const category = document.getElementById("videoCategory").value;
    const consent = document.getElementById("videoConsent").checked;

    if (!title || !category || !selectedFile) {
        showFormMessage("Please complete the title, category and video fields.", "error");
        return;
    }

    if (!consent) {
        showFormMessage("Please confirm that you have permission to share this video.", "error");
        return;
    }

    // The browser creates a temporary URL for the selected video.
    // This video is not uploaded to a server in this frontend prototype.
    const videoUrl = selectedObjectUrl;

    uploadedVideos.unshift({
        id: `upload-${Date.now()}`,
        title,
        description: description || "A video shared with the SOBA community.",
        category,
        creator: userName,
        initials: userInitial,
        views: "0",
        date: new Date().toISOString().slice(0, 10),
        duration: "Your video",
        thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=900",
        videoUrl,
        likes: 0,
        comments: 0,
        demo: false
    });

    // Keep the object URL alive while this page remains open.
    // Do not revoke it when the upload modal closes.
    selectedObjectUrl = null;
    selectedFile = null;

    uploadForm.reset();
    clearUploadPreviewOnly();

    closeUploadModal();
    activeCategory = "All";

    document.querySelectorAll(".category-chip").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.category === "All");
    });

    searchInput.value = "";
    sortSelect.value = "recent";

    renderVideos();
    showToast("Your video has been added to this demo feed.");
});

function clearUploadPreviewOnly() {
    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.load();

    videoFileInput.value = "";
    fileLabel.textContent = "Choose a video from your device";
    uploadPreview.classList.add("hidden");
}

// Profile menu
document.getElementById("profileButton").addEventListener("click", () => {
    document.getElementById("profileMenu").classList.toggle("show");
});

document.addEventListener("click", event => {
    const profileArea = document.querySelector(".profile-area");

    if (!profileArea.contains(event.target)) {
        document.getElementById("profileMenu").classList.remove("show");
    }
});

// Logout
document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("sobaCurrentUser");
    window.location.href = "login.html";
});

// Keyboard support
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        if (!playerModal.classList.contains("hidden")) {
            closeVideoPlayer();
        } else if (uploadModal.classList.contains("show")) {
            closeUploadModal();
        }
    }
});

// Initial page render
renderVideos();