
// ======================================
// SOBA SHARED STORAGE
// Shared posts and media for all pages
// ======================================

(function () {
    const POSTS_KEY = "sobaCommunityPosts";
    const DB_NAME = "SOBA_Media_Database";
    const STORE_NAME = "media";

    function getPosts() {
        try {
            const posts = JSON.parse(
                localStorage.getItem(POSTS_KEY) || "[]"
            );

            return Array.isArray(posts) ? posts : [];
        } catch {
            return [];
        }
    }

    function savePosts(posts) {
        try {
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
            return true;
        } catch (error) {
            console.error("SOBA posts storage error:", error);
            return false;
        }
    }

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, {
                        keyPath: "id"
                    });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function saveMedia(file) {
        const db = await openDatabase();

        const mediaId = `media-${Date.now()}-${Math.random()
            .toString(36).slice(2)}`;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");

            transaction.objectStore(STORE_NAME).put({
                id: mediaId,
                file,
                type: file.type,
                name: file.name,
                createdAt: new Date().toISOString()
            });

            transaction.oncomplete = () => {
                db.close();
                resolve(mediaId);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    async function getMediaUrl(mediaId) {
        if (!mediaId) return "";

        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).get(mediaId);

            request.onsuccess = () => {
                const result = request.result;
                db.close();

                if (!result) {
                    resolve("");
                    return;
                }

                resolve(URL.createObjectURL(result.file));
            };

            request.onerror = () => {
                db.close();
                reject(request.error);
            };
        });
    }

    async function deleteMedia(mediaId) {
        if (!mediaId) return;

        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");

            transaction.objectStore(STORE_NAME).delete(mediaId);

            transaction.oncomplete = () => {
                db.close();
                resolve(true);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    function addPost(post) {
        const posts = getPosts();

        posts.unshift({
            ...post,
            createdAt: post.createdAt || new Date().toISOString()
        });

        return savePosts(posts);
    }

    function updatePost(postId, updates) {
        const posts = getPosts();
        const index = posts.findIndex(post => post.id === postId);

        if (index === -1) return false;

        posts[index] = {
            ...posts[index],
            ...updates
        };

        return savePosts(posts);
    }

    function getUserPosts(email) {
        const normalizedEmail = (email || "").toLowerCase();

        return getPosts().filter(post =>
            (post.ownerEmail || "").toLowerCase() === normalizedEmail
        );
    }

    window.SobaStore = {
        getPosts,
        savePosts,
        addPost,
        updatePost,
        getUserPosts,
        saveMedia,
        getMediaUrl,
        deleteMedia
    };
})();
