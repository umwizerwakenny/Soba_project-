
"use strict";

/* ================================
   SOBA MESSAGES
================================ */

const app = document.querySelector(".messages-app");
const inboxList = document.getElementById("inboxList");
const chatContent = document.getElementById("chatContent");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const searchChats = document.getElementById("searchChats");
const toast = document.getElementById("toast");

let currentUser = null;

try {
    currentUser = JSON.parse(
        sessionStorage.getItem("sobaCurrentUser") || "null"
    );
} catch (error) {
    currentUser = null;
}

if (!currentUser) {
    window.location.replace("login.html");
} else {
    startMessagesPage();
}

function startMessagesPage() {

    const myName = currentUser.fullName || "SOBA Member";

    const sidebarUser = document.getElementById("sidebarUser");

    if (sidebarUser) {
        sidebarUser.textContent = myName;
    }

    let selectedChat = null;
    let activeFilter = "all";
    let attachedFile = null;

    const people = [
        {
            id: "p1",
            name: "Aline Uwase",
            initials: "AU",
            color: "#bd777d",
            type: "member",
            online: true,
            messages: [
                {
                    sender: "them",
                    text: "Hello! Welcome to SOBA. How are you today?",
                    time: "09:15"
                },
                {
                    sender: "me",
                    text: "I am doing well, thank you!",
                    time: "09:18"
                },
                {
                    sender: "them",
                    text: "That is great. What are you learning today?",
                    time: "09:20"
                }
            ]
        },
        {
            id: "p2",
            name: "Youth Learning Circle",
            initials: "YL",
            color: "#478f9b",
            type: "group",
            online: true,
            messages: [
                {
                    sender: "them",
                    text: "Welcome to our learning circle!",
                    time: "Yesterday"
                }
            ]
        },
        {
            id: "p3",
            name: "Eric Ndayisenga",
            initials: "EN",
            color: "#657fb6",
            type: "member",
            online: false,
            messages: [
                {
                    sender: "them",
                    text: "Have you heard about the community activity?",
                    time: "Yesterday"
                }
            ]
        },
        {
            id: "p4",
            name: "Ideas & Innovation",
            initials: "II",
            color: "#9a7aaf",
            type: "group",
            online: true,
            messages: [
                {
                    sender: "them",
                    text: "Let's share positive ideas.",
                    time: "Mon"
                }
            ]
        },
        {
            id: "p5",
            name: "Diane Mukamana",
            initials: "DM",
            color: "#b38a54",
            type: "member",
            online: false,
            messages: [
                {
                    sender: "them",
                    text: "I enjoyed the discussion yesterday.",
                    time: "Mon"
                }
            ]
        }
    ];

    /* Load saved conversations */

    try {
        const saved = JSON.parse(
            localStorage.getItem("sobaMessages") || "null"
        );

        if (Array.isArray(saved)) {
            saved.forEach(savedPerson => {
                const person = people.find(
                    p => p.id === savedPerson.id
                );

                if (person && Array.isArray(savedPerson.messages)) {
                    person.messages = savedPerson.messages;
                }
            });
        }
    } catch (error) {
        console.warn("Could not load saved messages.");
    }

    function saveMessages() {
        localStorage.setItem(
            "sobaMessages",
            JSON.stringify(
                people.map(person => ({
                    id: person.id,
                    messages: person.messages
                }))
            )
        );
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

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    function getLastMessage(person) {
        const last = person.messages[person.messages.length - 1];

        return last ? last.text : "Start a conversation";
    }

    function getLastTime(person) {
        const last = person.messages[person.messages.length - 1];

        return last ? last.time : "";
    }

    /* ================================
       COMPACT INBOX
    ================================= */

    function renderInbox() {
        if (!inboxList) return;

        const search = searchChats
            ? searchChats.value.toLowerCase().trim()
            : "";

        const filteredPeople = people.filter(person => {

            const matchesSearch =
                person.name.toLowerCase().includes(search) ||
                getLastMessage(person).toLowerCase().includes(search);

            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "groups" && person.type === "group") ||
                (activeFilter === "unread" && person.unread);

            return matchesSearch && matchesFilter;
        });

        inboxList.innerHTML = "";

        if (filteredPeople.length === 0) {
            inboxList.innerHTML = `
                <div class="empty-inbox">
                    No conversations found.
                </div>
            `;
            return;
        }

        filteredPeople.forEach(person => {

            const button = document.createElement("button");

            button.className =
                "chat-item" +
                (selectedChat === person.id ? " selected" : "");

            button.innerHTML = `
                <div class="chat-avatar"
                     style="background:${person.color}">
                    ${escapeHTML(person.initials)}
                </div>

                <div class="chat-info">
                    <div class="chat-info-top">
                        <strong>${escapeHTML(person.name)}</strong>
                        <time>${escapeHTML(getLastTime(person))}</time>
                    </div>

                    <p>${escapeHTML(getLastMessage(person))}</p>
                </div>

                ${person.unread ? '<span class="unread-dot"></span>' : ""}
            `;

            button.addEventListener("click", () => {
                openChat(person.id);
            });

            inboxList.appendChild(button);
        });
    }

    /* ================================
       OPEN CONVERSATION
    ================================= */

    function openChat(id) {

        selectedChat = id;

        const person = people.find(p => p.id === id);

        if (!person) return;

        person.unread = false;

        const conversationHeader =
            document.getElementById("conversationHeader");

        const conversationFocus =
            document.getElementById("conversationFocus");

        if (conversationHeader) {
            conversationHeader.innerHTML = `
                <div class="active-person">

                    <button class="composer-tool mobile-back"
                            id="mobileBack"
                            title="Back">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>

                    <div class="chat-avatar"
                         style="background:${person.color}">
                        ${escapeHTML(person.initials)}
                    </div>

                    <div class="person-details">
                        <h3>${escapeHTML(person.name)}</h3>
                        <p>
                            ${person.online ? "Online" : "SOBA Member"}
                        </p>
                    </div>

                </div>
            `;
        }

        /* Hide the large conversation focus section */

        if (conversationFocus) {
            conversationFocus.innerHTML = "";
            conversationFocus.style.display = "none";
        }

        renderMessages(person);
        renderInbox();

        if (messageInput) {
            messageInput.disabled = false;
        }

        if (sendBtn) {
            sendBtn.disabled = true;
        }

        if (window.innerWidth <= 760 && app) {
            app.classList.add("chat-open");
        }

        document.getElementById("mobileBack")
            ?.addEventListener("click", () => {
                app?.classList.remove("chat-open");
            });

        messageInput?.focus();
    }

    /* ================================
       DISPLAY MESSAGES
    ================================= */

    function renderMessages(person) {

        if (!chatContent) return;

        chatContent.innerHTML = `
            <div class="message-day">
                Conversation
            </div>
        `;

        person.messages.forEach(message => {

            const mine = message.sender === "me";

            const row = document.createElement("div");

            row.className =
                "message-row" + (mine ? " mine" : "");

            const avatarColor = mine
                ? "#14243A"
                : person.color;

            const avatarText = mine
                ? "ME"
                : person.initials;

            row.innerHTML = `
                <div class="message-avatar"
                     style="background:${avatarColor}">
                    ${escapeHTML(avatarText)}
                </div>

                <div class="message-bubble">
                    <p>${escapeHTML(message.text)}</p>
                    <span class="message-time">
                        ${escapeHTML(message.time)}
                    </span>
                </div>
            `;

            chatContent.appendChild(row);
        });

        chatContent.scrollTop = chatContent.scrollHeight;
    }

    /* ================================
       SEND MESSAGE
    ================================= */

    function sendMessage(text) {

        const person = people.find(
            p => p.id === selectedChat
        );

        if (!person || !text.trim()) return;

        const now = new Date();

        const time = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        person.messages.push({
            sender: "me",
            text: text.trim(),
            time
        });

        saveMessages();
        renderMessages(person);
        renderInbox();
    }

    if (messageForm) {
        messageForm.addEventListener("submit", event => {

            event.preventDefault();

            const text = messageInput.value.trim();

            if (!selectedChat) {
                showToast("Select a conversation first.");
                return;
            }

            if (!text && !attachedFile) return;

            let finalMessage = text;

            if (attachedFile) {
                finalMessage += text
                    ? ` [Attachment: ${attachedFile.name}]`
                    : `Attachment: ${attachedFile.name}`;
            }

            sendMessage(finalMessage);

            messageInput.value = "";
            messageInput.style.height = "22px";

            attachedFile = null;

            const attachmentName =
                document.getElementById("attachmentName");

            if (attachmentName) {
                attachmentName.textContent = "";
            }

            if (sendBtn) sendBtn.disabled = true;

            messageInput.focus();
        });
    }

    if (messageInput) {
        messageInput.disabled = true;

        messageInput.addEventListener("input", function() {

            if (sendBtn) {
                sendBtn.disabled =
                    !this.value.trim() && !attachedFile;
            }

            this.style.height = "22px";

            this.style.height =
                Math.min(this.scrollHeight, 100) + "px";
        });
    }

    /* Search */

    searchChats?.addEventListener("input", renderInbox);

    /* Filters */

    document.querySelectorAll(".tab-button").forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".tab-button").forEach(tab => {
                tab.classList.remove("active");
            });

            button.classList.add("active");

            activeFilter = button.dataset.filter;

            renderInbox();
        });
    });

    /* Attach file - prototype */

    document.getElementById("attachBtn")
        ?.addEventListener("click", () => {
            document.getElementById("fileInput")?.click();
        });

    document.getElementById("fileInput")
        ?.addEventListener("change", function() {

            const file = this.files[0];

            if (!file) return;

            attachedFile = file;

            const attachmentName =
                document.getElementById("attachmentName");

            if (attachmentName) {
                attachmentName.textContent =
                    "Selected: " + file.name;
            }

            if (sendBtn) sendBtn.disabled = false;
        });

    /* Conversation idea */

    document.getElementById("ideaBtn")
        ?.addEventListener("click", () => {

            const ideas = [
                "What is one useful skill you would like to learn?",
                "What positive change would you like in your community?",
                "What knowledge can we share with each other?",
                "What inspires you to keep learning?"
            ];

            const idea = ideas[
                Math.floor(Math.random() * ideas.length)
            ];

            if (!messageInput) return;

            messageInput.value = idea;

            messageInput.dispatchEvent(
                new Event("input")
            );

            messageInput.focus();
        });

    /* New conversation */

    document.getElementById("newMessageBtn")
        ?.addEventListener("click", () => {
            showToast(
                "New connections will be available when SOBA has registered users."
            );
        });

    /* Logout */

    document.getElementById("logoutBtn")
        ?.addEventListener("click", () => {

            sessionStorage.removeItem("sobaCurrentUser");

            window.location.href = "login.html";
        });

    /* Initial display */

    renderInbox();

}
