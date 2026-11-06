
/* ============================================
   SOBA SOCIAL DASHBOARD
   Photos | Videos | Audio | Discussions
   Connected to SOBA Storage
   Persistent Follow System
============================================ */

(() => {
    "use strict";

    // ============================================
    // 1. CURRENT USER
    // ============================================

    let currentUser = null;

    try {
        currentUser = JSON.parse(
            sessionStorage.getItem("sobaCurrentUser") || "null"
        );
    } catch (error) {
        console.error("User session error:", error);
    }

    if (!currentUser) {
        window.location.replace("login.html");
        return;
    }

    if (!window.SobaStore) {
        alert("SOBA Storage is not loaded. Check dashboard.html.");
        return;
    }

    const userName =
        currentUser.fullName ||
        currentUser.name ||
        "SOBA Member";

    const userEmail =
        (currentUser.email || "").toLowerCase().trim();

    const userRole = currentUser.role || "Community Member";
    const firstLetter = userName.charAt(0).toUpperCase();

    const getElement = id => document.getElementById(id);

    // ============================================
    // 2. SAFE HTML
    // ============================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    // ============================================
    // 3. USER INFORMATION
    // ============================================

    const userInformation = [
        ["topUserName", userName],
        ["sidebarUserName", userName],
        ["sidebarUserRole", userRole],
        ["topAvatar", firstLetter],
        ["sidebarAvatar", firstLetter],
        ["composerAvatar", firstLetter]
    ];

    userInformation.forEach(([id, value]) => {
        const element = getElement(id);

        if (element) {
            element.textContent = value;
        }
    });

    const profileDetails = getElement("profileDetails");

    if (profileDetails) {
        profileDetails.textContent =
            `${userName} • ${userEmail} • ${userRole}`;
    }

    // ============================================
    // 4. TOAST NOTIFICATIONS
    // ============================================

    let toastTimeout;

    function showToast(message) {
        const toast = getElement("toast");

        if (!toast) {
            console.log(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    // ============================================
    // 5. FOLLOW SYSTEM
    // ============================================

    const FOLLOWING_KEY = "sobaFollowing";

    function getFollowingData() {
        try {
            const data = JSON.parse(
                localStorage.getItem(FOLLOWING_KEY) || "{}"
            );

            return data && typeof data === "object" ? data : {};

        } catch (error) {
            return {};
        }
    }

    function saveFollowingData(data) {
        try {
            localStorage.setItem(
                FOLLOWING_KEY,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {
            console.error("Follow storage error:", error);
            showToast("Unable to save Follow changes.");
            return false;
        }
    }

    function getMyFollowing() {
        const data = getFollowingData();

        return Array.isArray(data[userEmail])
            ? data[userEmail]
            : [];
    }

    function isFollowing(targetEmail) {
        return getMyFollowing().some(
            person => person.email === targetEmail
        );
    }

    function followUser(targetEmail, targetName) {
        targetEmail = (targetEmail || "").toLowerCase().trim();

        if (!targetEmail || !targetName) {
            showToast("Member information is missing.");
            return false;
        }

        if (targetEmail === userEmail) {
            showToast("You cannot follow your own account.");
            return false;
        }

        const data = getFollowingData();

        if (!Array.isArray(data[userEmail])) {
            data[userEmail] = [];
        }

        if (
            data[userEmail].some(
                person => person.email === targetEmail
            )
        ) {
            return false;
        }

        data[userEmail].push({
            email: targetEmail,
            name: targetName,
            followedAt: new Date().toISOString()
        });

        return saveFollowingData(data);
    }

    function unfollowUser(targetEmail) {
        targetEmail = (targetEmail || "").toLowerCase().trim();

        const data = getFollowingData();

        if (!Array.isArray(data[userEmail])) {
            data[userEmail] = [];
        }

        data[userEmail] = data[userEmail].filter(
            person => person.email !== targetEmail
        );

        return saveFollowingData(data);
    }

    function updateFollowButtons() {
        document.querySelectorAll(".follow-btn").forEach(button => {

            const targetEmail = (
                button.dataset.userEmail || ""
            ).toLowerCase().trim();

            if (!targetEmail) return;

            const following = isFollowing(targetEmail);

            button.classList.toggle("following", following);

            button.textContent = following
                ? "Following"
                : "Follow";

            button.setAttribute(
                "aria-pressed",
                String(following)
            );
        });
    }

    document.addEventListener("click", event => {

        const button = event.target.closest(".follow-btn");

        if (!button) return;

        const targetEmail = button.dataset.userEmail;
        const targetName = button.dataset.userName;

        if (!targetEmail || !targetName) {
            showToast("Member information is missing.");
            return;
        }

        if (isFollowing(targetEmail.toLowerCase())) {

            if (unfollowUser(targetEmail)) {
                showToast(`You unfollowed ${targetName}.`);
            }

        } else {

            if (followUser(targetEmail, targetName)) {
                showToast(`You are now following ${targetName}.`);
            }
        }

        updateFollowButtons();
    });

    // ============================================
    // 6. STORIES
    // ============================================

    const stories = [
        {
            name: "Angel Uwase",
            letter: "A",
            image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500",
            text: "Learning and growing together! Every new skill is a new opportunity."
        },
        {
            name: "David M.",
            letter: "D",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500",
            text: "Today we are sharing new ideas about education and personal development."
        },
        {
            name: "Community Team",
            letter: "C",
            image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500",
            text: "Small actions can make a positive difference in our communities."
        },
        {
            name: "Jean Patrick",
            letter: "J",
            image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500",
            text: "Working together, learning together and building together."
        }
    ];

    const storiesList = getElement("storiesList");

    function renderStories() {
        if (!storiesList) return;

        storiesList.innerHTML = "";

        stories.forEach((story, index) => {

            const card = document.createElement("button");

            card.className = "story-card";

            card.style.backgroundImage =
                `url("${story.image}")`;

            card.innerHTML = `
                <span class="story-avatar">
                    ${escapeHTML(story.letter)}
                </span>

                <strong>${escapeHTML(story.name)}</strong>
            `;

            card.addEventListener("click", () => {
                openStory(index);
            });

            storiesList.appendChild(card);
        });
    }

    function openStory(index) {
        const story = stories[index];

        const viewer = getElement("storyViewerContent");
        const modal = getElement("storyModal");

        if (!viewer || !modal) return;

        viewer.innerHTML = `
            <div>
                <div class="story-avatar" style="margin:auto">
                    ${escapeHTML(story.letter)}
                </div>

                <h3>${escapeHTML(story.name)}</h3>

                <p>${escapeHTML(story.text)}</p>

                <small>SOBA Community Story</small>
            </div>
        `;

        modal.classList.add("show");
    }

    renderStories();

    getElement("closeStoryBtn")?.addEventListener("click", () => {
        getElement("storyModal")?.classList.remove("show");
    });

    getElement("storyModal")?.addEventListener("click", event => {
        if (event.target.id === "storyModal") {
            event.currentTarget.classList.remove("show");
        }
    });

    getElement("createStoryBtn")?.addEventListener("click", () => {
        showToast("Story creation will be added soon.");
    });

    // ============================================
    // 7. DEMO POSTS
    // ============================================

    const defaultPosts = [

        // PHOTOS

        {
            id: "demo-1",
            author: "Angel Uwase",
            letter: "A",
            time: "15 minutes ago",
            category: "photo",
            text: "Learning together, sharing knowledge and building a better community. 🌱",
            mediaType: "image",
            media: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000",
            likes: 45,
            likedBy: [],
            comments: []
        },

        {
            id: "demo-2",
            author: "SOBA Community",
            letter: "S",
            time: "35 minutes ago",
            category: "photo",
            text: "Community activities bring people together. Every positive action matters.",
            mediaType: "image",
            media: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000",
            likes: 67,
            likedBy: [],
            comments: []
        },

        {
            id: "demo-3",
            author: "David M.",
            letter: "D",
            time: "1 hour ago",
            category: "photo",
            text: "Education creates opportunities for everyone. Keep learning and growing.",
            mediaType: "image",
            media: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000",
            likes: 32,
            likedBy: [],
            comments: []
        },

        // VIDEOS

        {
            id: "demo-4",
            author: "SOBA Learning",
            letter: "S",
            time: "2 hours ago",
            category: "video",
            text: "A short video about nature, learning and appreciating our environment.",
            mediaType: "video",
            media: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            likes: 82,
            likedBy: [],
            comments: []
        },

        {
            id: "demo-5",
            author: "Youth Development",
            letter: "Y",
            time: "3 hours ago",
            category: "video",
            text: "Discover the importance of teamwork and working together.",
            mediaType: "video",
            media: "https://www.w3schools.com/html/mov_bbb.mp4",
            likes: 54,
            likedBy: [],
            comments: []
        },

        // AUDIO

        {
            id: "demo-6",
            author: "SOBA Conversations",
            letter: "S",
            time: "4 hours ago",
            category: "audio",
            text: "Community audio session: sharing ideas about education, personal development and positive living.",
            mediaType: "audio-demo",
            media: "",
            likes: 28,
            likedBy: [],
            comments: []
        },

        {
            id: "demo-7",
            author: "Youth Voices",
            letter: "Y",
            time: "Yesterday",
            category: "audio",
            text: "A community voice session about responsibility, creativity and helping others.",
            mediaType: "audio-demo",
            media: "",
            likes: 19,
            likedBy: [],
            comments: []
        },

        // DISCUSSIONS

        {
            id: "demo-8",
            author: "Jean Patrick",
            letter: "J",
            time: "Yesterday",
            category: "discussion",
            text: "What skills should young people learn today to prepare themselves for tomorrow? Let's share ideas and learn from each other.",
            mediaType: "none",
            media: "",
            likes: 39,
            likedBy: [],
            comments: [
                {
                    author: "Angel Uwase",
                    text: "Digital skills and communication are very important."
                }
            ]
        }
    ];

    // ============================================
    // 8. POSTS AND MEDIA STORAGE
    // ============================================

    let posts = [];

    let activeFilter = "all";

    let selectedMedia = null;
    let selectedMediaType = null;
    let selectedMediaURL = null;

    const mediaURLCache = new Map();

    let renderVersion = 0;

    const postsList = getElement("postsList");

    function loadPosts() {

        try {
            const savedPosts = SobaStore.getPosts();

            posts = Array.isArray(savedPosts)
                ? [...savedPosts, ...defaultPosts]
                : [...defaultPosts];

        } catch (error) {
            console.error("Could not load posts:", error);
            posts = [...defaultPosts];
        }
    }

    loadPosts();

    async function getPostMediaURL(post) {

        if (!post.mediaId) {
            return post.media || "";
        }

        if (mediaURLCache.has(post.mediaId)) {
            return mediaURLCache.get(post.mediaId);
        }

        try {
            const url = await SobaStore.getMediaUrl(post.mediaId);

            if (url) {
                mediaURLCache.set(post.mediaId, url);
            }

            return url || "";

        } catch (error) {
            console.error("Media loading error:", error);
            return "";
        }
    }

    function savePostChanges(post) {

        if (String(post.id).startsWith("demo-")) {
            return;
        }

        const result = SobaStore.updatePost(post.id, {
            likes: post.likes,
            likedBy: post.likedBy || [],
            comments: post.comments || []
        });

        if (result === false) {
            console.warn("Could not update post:", post.id);
        }
    }

    // ============================================
    // 9. MEDIA DISPLAY
    // ============================================

    function createMediaHTML(post, mediaURL) {

        if (post.mediaType === "image" && mediaURL) {

            return `
                <div class="post-media-container photo-container">
                    <img
                        class="post-media"
                        src="${escapeHTML(mediaURL)}"
                        alt="SOBA community photo"
                        loading="lazy"
                    >
                </div>
            `;
        }

        if (post.mediaType === "video" && mediaURL) {

            return `
                <div class="post-media-container video-container">
                    <video
                        class="post-media"
                        controls
                        preload="metadata"
                        playsinline
                        src="${escapeHTML(mediaURL)}"
                    >
                        Your browser does not support video playback.
                    </video>
                </div>
            `;
        }

        if (post.mediaType === "audio" && mediaURL) {

            return `
                <div class="audio-post-container">
                    <div class="audio-post-icon">
                        <i class="fa-solid fa-headphones"></i>
                    </div>

                    <div class="audio-post-content">
                        <strong>Audio conversation</strong>

                        <audio
                            controls
                            preload="metadata"
                            src="${escapeHTML(mediaURL)}"
                        >
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                </div>
            `;
        }

        if (post.mediaType === "audio-demo") {

            return `
                <div class="audio-post-container">
                    <div class="audio-post-icon">
                        <i class="fa-solid fa-microphone"></i>
                    </div>

                    <div class="audio-post-content">
                        <strong>SOBA Audio Session</strong>

                        <p>Community voice and discussion</p>

                        <span class="audio-demo-label">
                            Sample audio post
                        </span>
                    </div>
                </div>
            `;
        }

        if (post.mediaType === "video-demo") {

            return `
                <div class="media-placeholder">
                    <i class="fa-solid fa-circle-play"></i>
                    <strong>SOBA Video Preview</strong>
                    <small>Sample video post</small>
                </div>
            `;
        }

        return "";
    }

    // ============================================
    // 10. RENDER POSTS
    // ============================================

    async function renderPosts() {

        if (!postsList) return;

        const currentRender = ++renderVersion;

        let visiblePosts = [...posts];

        // Filter by content type

        if (activeFilter !== "all") {

            visiblePosts = visiblePosts.filter(post => {

                if (activeFilter === "photo") {
                    return post.category === "photo" ||
                        post.mediaType === "image";
                }

                if (activeFilter === "video") {
                    return post.category === "video" ||
                        post.mediaType === "video" ||
                        post.mediaType === "video-demo";
                }

                if (activeFilter === "audio") {
                    return post.category === "audio" ||
                        post.mediaType === "audio" ||
                        post.mediaType === "audio-demo";
                }

                return post.category === activeFilter;
            });
        }

        // Search

        const searchInput = getElement("searchInput");

        const searchQuery = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        if (searchQuery) {

            visiblePosts = visiblePosts.filter(post => {

                return (
                    (post.author || "").toLowerCase().includes(searchQuery) ||
                    (post.text || "").toLowerCase().includes(searchQuery) ||
                    (post.category || "").toLowerCase().includes(searchQuery)
                );
            });
        }

        // Sort

        const feedSort = getElement("feedSort");

        if (feedSort && feedSort.value === "popular") {
            visiblePosts.sort(
                (a, b) => (b.likes || 0) - (a.likes || 0)
            );
        }

        if (visiblePosts.length === 0) {

            postsList.innerHTML = `
                <div class="empty-feed">
                    <i class="fa-regular fa-folder-open"></i>

                    <h3>No content found</h3>

                    <p>There are no posts in this category yet.</p>
                </div>
            `;

            return;
        }

        postsList.innerHTML = `
            <div class="feed-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading community content...
            </div>
        `;

        const renderedPosts = await Promise.all(

            visiblePosts.map(async post => {

                const mediaURL = await getPostMediaURL(post);

                const mediaHTML = createMediaHTML(post, mediaURL);

                const comments = Array.isArray(post.comments)
                    ? post.comments
                    : [];

                const commentsHTML = comments.map(comment => {

                    return `
                        <div class="comment-bubble">
                            <strong>
                                ${escapeHTML(comment.author || "SOBA Member")}
                            </strong>

                            ${escapeHTML(comment.text)}
                        </div>
                    `;

                }).join("");

                const liked = (post.likedBy || []).includes(userEmail);

                const postCategory = (
                    post.category || "discussion"
                ).toUpperCase();

                return `
                    <article
                        class="post-card"
                        data-post-id="${escapeHTML(post.id)}"
                    >

                        <div class="post-header">

                            <span class="post-avatar">
                                ${escapeHTML(post.letter || "S")}
                            </span>

                            <div class="post-author">
                                <strong>
                                    ${escapeHTML(post.author || "SOBA Member")}
                                </strong>

                                <small>
                                    ${escapeHTML(post.time || "Recently")}
                                </small>
                            </div>

                            <span class="post-category">
                                ${escapeHTML(postCategory)}
                            </span>

                            <button
                                class="post-more"
                                type="button"
                                aria-label="More options"
                            >
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>

                        </div>

                        <p class="post-text">
                            ${escapeHTML(post.text || "")}
                        </p>

                        ${mediaHTML}

                        <div class="post-stats">

                            <span>
                                <i
                                    class="fa-solid fa-heart"
                                    style="color:#D96C79"
                                ></i>

                                ${post.likes || 0} likes
                            </span>

                            <span>
                                ${comments.length} comments
                            </span>

                        </div>

                        <div class="post-actions">

                            <button
                                class="post-action ${liked ? "liked" : ""}"
                                data-action="like"
                                type="button"
                            >
                                <i class="fa-${liked ? "solid" : "regular"} fa-heart"></i>

                                ${liked ? "Liked" : "Like"}
                            </button>

                            <button
                                class="post-action"
                                data-action="comment"
                                type="button"
                            >
                                <i class="fa-regular fa-comment"></i>
                                Comment
                            </button>

                            <button
                                class="post-action"
                                data-action="share"
                                type="button"
                            >
                                <i class="fa-solid fa-share"></i>
                                Share
                            </button>

                        </div>

                        <div
                            class="comments-area"
                            id="comments-${escapeHTML(post.id)}"
                        >

                            <div class="comment-list">
                                ${commentsHTML}
                            </div>

                            <form class="comment-form">

                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    required
                                    maxlength="500"
                                >

                                <button type="submit">
                                    Send
                                </button>

                            </form>

                        </div>

                    </article>
                `;
            })
        );

        // Prevent old rendering from replacing newer results

        if (currentRender !== renderVersion) return;

        postsList.innerHTML = renderedPosts.join("");
    }

    // ============================================
    // 11. POST INTERACTIONS
    // ============================================

    postsList?.addEventListener("click", async event => {

        const actionButton = event.target.closest("[data-action]");

        if (!actionButton) return;

        const postCard = actionButton.closest(".post-card");

        if (!postCard) return;

        const postId = postCard.dataset.postId;

        const post = posts.find(
            item => String(item.id) === postId
        );

        if (!post) return;

        const action = actionButton.dataset.action;

        // LIKE

        if (action === "like") {

            post.likedBy = post.likedBy || [];

            const alreadyLiked = post.likedBy.includes(userEmail);

            if (alreadyLiked) {

                post.likedBy = post.likedBy.filter(
                    email => email !== userEmail
                );

                post.likes = Math.max(
                    0,
                    (post.likes || 0) - 1
                );

            } else {

                post.likedBy.push(userEmail);

                post.likes = (post.likes || 0) + 1;
            }

            savePostChanges(post);

            renderPosts();

            return;
        }

        // COMMENT

        if (action === "comment") {

            const commentsArea =
                postCard.querySelector(".comments-area");

            if (!commentsArea) return;

            commentsArea.classList.toggle("show");

            if (commentsArea.classList.contains("show")) {
                commentsArea.querySelector("input")?.focus();
            }

            return;
        }

        // SHARE

        if (action === "share") {

            const shareText =
                `${post.author} shared on SOBA: ${post.text}`;

            if (navigator.share) {

                try {
                    await navigator.share({
                        title: "SOBA Community",
                        text: shareText
                    });

                } catch (error) {
                    // User cancelled sharing.
                }

            } else if (navigator.clipboard) {

                try {
                    await navigator.clipboard.writeText(shareText);

                    showToast("Post copied. You can share it now.");

                } catch (error) {
                    showToast("Sharing is unavailable.");
                }

            } else {

                showToast("Sharing is unavailable in this browser.");
            }
        }
    });

    // ============================================
    // 12. COMMENTS
    // ============================================

    postsList?.addEventListener("submit", event => {

        if (!event.target.classList.contains("comment-form")) {
            return;
        }

        event.preventDefault();

        const postCard = event.target.closest(".post-card");

        if (!postCard) return;

        const postId = postCard.dataset.postId;

        const post = posts.find(
            item => String(item.id) === postId
        );

        const input = event.target.querySelector("input");

        const commentText = input.value.trim();

        if (!commentText || !post) return;

        post.comments = post.comments || [];

        post.comments.push({
            author: userName,
            ownerEmail: userEmail,
            text: commentText,
            createdAt: new Date().toISOString()
        });

        savePostChanges(post);

        renderPosts().then(() => {

            const updatedArea =
                getElement(`comments-${postId}`);

            if (updatedArea) {
                updatedArea.classList.add("show");
            }
        });

        showToast("Comment added successfully.");
    });

    // ============================================
    // 13. CREATE POSTS
    // ============================================

    const fileInputs = [
        { id: "photoInput", type: "image" },
        { id: "videoInput", type: "video" },
        { id: "audioInput", type: "audio" }
    ];

    fileInputs.forEach(item => {

        getElement(item.id)?.addEventListener("change", event => {

            const file = event.target.files[0];

            if (!file) return;

            const allowedTypes = {
                image: "image/",
                video: "video/",
                audio: "audio/"
            };

            if (!file.type.startsWith(allowedTypes[item.type])) {

                showToast(`Please select a valid ${item.type} file.`);

                event.target.value = "";

                return;
            }

            if (selectedMediaURL) {
                URL.revokeObjectURL(selectedMediaURL);
            }

            selectedMedia = file;
            selectedMediaType = item.type;

            selectedMediaURL = URL.createObjectURL(file);

            const selectedFile = getElement("selectedFile");

            if (selectedFile) {
                selectedFile.textContent =
                    `Selected ${item.type}: ${file.name}`;
            }
        });
    });

    // PUBLISH POST

    getElement("publishBtn")?.addEventListener("click", async () => {

        const publishButton = getElement("publishBtn");

        const postText = getElement("postText");

        const text = postText ? postText.value.trim() : "";

        if (!text && !selectedMedia) {

            showToast(
                "Write something or choose a media file first."
            );

            return;
        }

        publishButton.disabled = true;
        publishButton.textContent = "Publishing...";

        let mediaId = null;

        try {

            // Save uploaded media

            if (selectedMedia) {
                mediaId = await SobaStore.saveMedia(selectedMedia);
            }

            const postCategory = selectedMediaType === "image"
                ? "photo"
                : selectedMediaType || "discussion";

            const newPost = {

                id: `post-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,

                ownerEmail: userEmail,

                author: userName,

                letter: firstLetter,

                time: "Just now",

                createdAt: new Date().toISOString(),

                category: postCategory,

                text: text ||
                    `Shared a new ${postCategory} post with the SOBA community.`,

                mediaType: selectedMediaType || "none",

                mediaId: mediaId,

                likes: 0,

                likedBy: [],

                comments: []
            };

            const saved = SobaStore.addPost(newPost);

            if (saved === false) {

                if (mediaId) {
                    await SobaStore.deleteMedia(mediaId);
                }

                throw new Error("Post could not be saved.");
            }

            posts.unshift(newPost);

            // Clear composer

            if (postText) {
                postText.value = "";
            }

            const selectedFile = getElement("selectedFile");

            if (selectedFile) {
                selectedFile.textContent = "";
            }

            fileInputs.forEach(item => {
                const input = getElement(item.id);

                if (input) input.value = "";
            });

            selectedMedia = null;
            selectedMediaType = null;

            if (selectedMediaURL) {
                URL.revokeObjectURL(selectedMediaURL);
                selectedMediaURL = null;
            }

            // Show all posts after publishing

            activeFilter = "all";

            document.querySelectorAll(
                ".menu-item[data-filter]"
            ).forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter === "all"
                );
            });

            await renderPosts();

            showToast("Your post has been published successfully!");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error("Publishing error:", error);

            showToast(
                "Could not publish. Check storage and try again."
            );

        } finally {

            publishButton.disabled = false;
            publishButton.textContent = "Publish";
        }
    });

    // ============================================
    // 14. CONTENT FILTERS
    // ============================================

    document.querySelectorAll(
        ".menu-item[data-filter]"
    ).forEach(button => {

        button.addEventListener("click", () => {

            activeFilter = button.dataset.filter;

            document.querySelectorAll(
                ".menu-item[data-filter]"
            ).forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            renderPosts();

            getElement("sidebar")?.classList.remove("open");
        });
    });

    // ============================================
    // 15. SEARCH AND SORT
    // ============================================

    getElement("searchInput")?.addEventListener(
        "input",
        renderPosts
    );

    getElement("feedSort")?.addEventListener(
        "change",
        renderPosts
    );

    // ============================================
    // 16. PROFILE MENU
    // ============================================

    getElement("profileButton")?.addEventListener("click", () => {

        getElement("profileMenu")?.classList.toggle("show");
    });

    document.addEventListener("click", event => {

        const menu = getElement("profileMenu");
        const button = getElement("profileButton");

        if (
            menu &&
            button &&
            !menu.contains(event.target) &&
            !button.contains(event.target)
        ) {
            menu.classList.remove("show");
        }
    });

    // ============================================
    // 17. LOGOUT
    // ============================================

    function logout() {

        sessionStorage.removeItem("sobaCurrentUser");

        window.location.replace("login.html");
    }

    getElement("logoutBtn")?.addEventListener("click", logout);

    getElement("sidebarLogout")?.addEventListener("click", logout);

    // ============================================
    // 18. MOBILE MENU
    // ============================================

    getElement("mobileMenuBtn")?.addEventListener("click", () => {

        getElement("sidebar")?.classList.toggle("open");
    });

    // ============================================
    // 19. NOTIFICATIONS
    // ============================================

    getElement("notificationBtn")?.addEventListener("click", () => {

        showToast(
            "You are all caught up with SOBA notifications."
        );
    });

    // ============================================
    // 20. EXPLORE
    // ============================================

    function exploreContent() {

        activeFilter = "all";

        const searchInput = getElement("searchInput");

        if (searchInput) {
            searchInput.value = "";
        }

        const feedSort = getElement("feedSort");

        if (feedSort) {
            feedSort.value = "recent";
        }

        document.querySelectorAll(
            ".menu-item[data-filter]"
        ).forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.filter === "all"
            );
        });

        renderPosts();

        getElement("sidebar")?.classList.remove("open");

        document.querySelector(".stories-section")
            ?.scrollIntoView({
                behavior: "smooth"
            });
    }

    getElement("exploreButton")?.addEventListener(
        "click",
        exploreContent
    );

    getElement("exploreMenuButton")?.addEventListener(
        "click",
        exploreContent
    );

    // ============================================
    // 21. INITIAL PAGE LOAD
    // ============================================

    updateFollowButtons();

    renderPosts();

    console.log("SOBA Dashboard loaded successfully.");

})();
