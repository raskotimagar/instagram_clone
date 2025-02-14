// Utility Functions
const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};

const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
};

// WebSocket Handling
class ChatSocket {
    constructor(url, callbacks) {
        this.url = url;
        this.callbacks = callbacks;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("WebSocket connected");
            this.retryCount = 0; // Reset retry count on successful connection
        };

        this.socket.onmessage = (event) => this.handleMessage(event.data);

        this.socket.onerror = (error) => {
            console.error("WebSocket Error: ", error);
            this.reconnect();
        };

        this.socket.onclose = () => {
            console.warn("WebSocket closed. Attempting to reconnect...");
            this.reconnect();
        };
    }

    reconnect() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => this.connect(), 1000 * this.retryCount); // Exponential backoff
        } else {
            console.error("Max reconnection attempts reached. Please refresh the page.");
        }
    }

    sendMessage(messageType, data) {
        if (this.socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type: messageType, ...data });
            this.socket.send(message);
        } else {
            console.warn("WebSocket is not open. Cannot send message.");
        }
    }

    handleMessage(data) {
        try {
            const parsedData = JSON.parse(data);
            const { type } = parsedData;
            switch (type) {
                case "TextMessage":
                    this.callbacks.addMessage(parsedData);
                    break;
                case "FileMessage":
                    this.callbacks.addMessage(parsedData);
                    break;
                case "IsTyping":
                    this.callbacks.showTyping(parsedData.user);
                    break;
                default:
                    console.warn(`Unhandled message type: ${type}`);
            }
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    }
}

// API Functions
const uploadFile = async (file, csrfToken) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers = {
        "X-CSRFToken": csrfToken
    };

    const response = await fetch("/upload/endpoint/", {
        method: "POST",
        body: formData,
        headers
    });

    if (!response.ok) throw new Error("File upload failed");
    return await response.json();
};

// UI Helpers
const createMessageBox = (message, selfUser) => {
    const isOutgoing = message.sender === selfUser;
    return {
        position: isOutgoing ? "right" : "left",
        text: message.text || message.file.name,
        date: new Date(message.sent).toLocaleString(),
        avatar: `/avatars/${message.sender}.jpg`,
        status: isOutgoing ? "Sent" : "Received"
    };
};

const renderMessage = (messageBox) => {
    const container = document.getElementById("messageContainer");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${messageBox.position}`;
    messageDiv.innerHTML = `
        <img src="${messageBox.avatar}" alt="Avatar">
        <div>
            <p>${messageBox.text}</p>
            <span>${messageBox.date} - ${messageBox.status}</span>
        </div>
    `;
    container.appendChild(messageDiv);
};

// Typing Indicator
const showTypingIndicator = (user) => {
    const typingElement = document.getElementById("typingIndicator");
    typingElement.textContent = `${user} is typing...`;
    setTimeout(() => (typingElement.textContent = ""), 3000); // Clear after 3 seconds
};

// Initialize ChatSocket
const chatSocket = new ChatSocket("ws://127.0.0.1:8000/ws/chat", {
    addMessage: (message) => {
        const messageBox = createMessageBox(message, "current_user");
        renderMessage(messageBox);
    },
    showTyping: showTypingIndicator
});

// Event Listeners
document.getElementById("sendButton").addEventListener("click", () => {
    const text = document.getElementById("messageInput").value;
    chatSocket.sendMessage("TextMessage", { text, user: "recipient_user" });
    document.getElementById("messageInput").value = "";
});



document.addEventListener('DOMContentLoaded', function () {

    // Constants
    const TYPING_TIMEOUT = 3000;
    const socket = new WebSocket('ws://' + window.location.host + '/chat_ws');
    const state = {
        socketConnectionState: 0,
        showNewChatPopup: false,
        newChatChosen: null,
        usersDataLoading: false,
        availableUsers: [],
        messageList: [],
        dialogList: [],
        filteredDialogList: [],
        typingPKs: [],
        onlinePKs: [],
        selfInfo: null,
        selectedDialog: null,
    };

    // Helper Functions
    const getCookie = (name) => {
        return document.cookie.split(';').map(c => c.trim()).find(cookie => cookie.startsWith(`${name}=`))?.split('=')[1] || null;
    };

    const updateSocketState = () => {
        const connectionStateElement = document.querySelector("#connectionState");
        connectionStateElement.textContent = ["Connecting...", "Connected", "Disconnecting...", "Disconnected"][state.socketConnectionState] || "Unknown";
    };
    

    const renderDialogs = () => {
        const chatList = document.querySelector("#chatList");
        chatList.innerHTML = ''; // Clear the list before rendering
    
        state.filteredDialogList.forEach(dialog => {
            const div = document.createElement("div");
            div.classList.add("chat-item");
            div.addEventListener("click", () => selectDialog(dialog));
    
            // User Avatar
            const avatar = document.createElement("img");
            avatar.src = dialog.avatar || 'default-avatar.png'; // Fallback to a default avatar
            avatar.alt = `${dialog.title}'s profile picture`;
            avatar.classList.add("chat-item-avatar");
    
            // User Name
            const name = document.createElement("p");
            name.textContent = dialog.title;
            name.classList.add("chat-item-name");
    
            // Last Message
            const lastMessage = document.createElement("p");
            lastMessage.textContent = dialog.lastMessage || "No messages yet";
            lastMessage.classList.add("chat-item-last-message");
    
            // Timestamp
            const timestamp = document.createElement("span");
            timestamp.textContent = dialog.timestamp ? formatTimestamp(dialog.timestamp) : "";
            timestamp.classList.add("chat-item-timestamp");
    
            // Unread Message Count
            const unreadCount = document.createElement("span");
            if (dialog.unreadCount > 0) {
                unreadCount.textContent = dialog.unreadCount;
                unreadCount.classList.add("chat-item-unread-count");
            }
    
            // Online Status
            const onlineStatus = document.createElement("span");
            if (dialog.isOnline) {
                onlineStatus.classList.add("chat-item-online-status");
                onlineStatus.title = "Online";
            }
    
            // Append all elements to the chat item
            div.appendChild(avatar);
            div.appendChild(name);
            div.appendChild(lastMessage);
            div.appendChild(timestamp);
            div.appendChild(unreadCount);
            div.appendChild(onlineStatus);
    
            // Append the chat item to the chat list
            chatList.appendChild(div);
        });
    };

    const selectDialog = (dialog) => {
        state.selectedDialog = dialog;
        renderMessages();
    };

    const renderMessages = () => {
        const messageList = document.querySelector("#messageList");
        messageList.innerHTML = '';
        const messages = state.messageList.filter(msg => msg.dialog_id === state.selectedDialog?.id);
        messages.forEach(msg => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");
            messageDiv.textContent = msg.content;
            messageList.appendChild(messageDiv);
        });
    };

    const performSendingMessage = () => {
        const textInput = document.querySelector("#textInput");
        const message = textInput.value.trim();
        if (!message || !state.selectedDialog) return;

        textInput.value = '';
        sendOutgoingTextMessage(message, state.selectedDialog.id);
    };

    const sendOutgoingTextMessage = (text, dialogId) => {
        const message = { content: text, dialog_id: dialogId, timestamp: new Date() };
        state.messageList.push(message);
        renderMessages();
    };

    const isTyping = () => {
        if (state.selectedDialog) {
            socket.send(JSON.stringify({ type: "is_typing", dialog_id: state.selectedDialog.id }));
        }
    };

    // Classes
    class TypingHandler {
        constructor(typingElement) {
            this.typingElement = typingElement;
            this.typingTimeout = null;
        }

        showTyping(user) {
            this.typingElement.textContent = `${user} is typing...`;
            this.typingElement.classList.add("visible");

            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.typingElement.classList.remove("visible");
            }, TYPING_TIMEOUT);
        }
    }

    class PresenceHandler {
        constructor(userListElement) {
            this.userListElement = userListElement;
            this.onlineUsers = new Map();
        }

        updatePresence(userId, status, lastSeen = null) {
            this.onlineUsers.set(userId, { status, lastSeen });
            this.render();
        }

        render() {
            this.userListElement.innerHTML = '';
            this.onlineUsers.forEach((data, userId) => {
                const userDiv = document.createElement("div");
                userDiv.classList.add("user");
                const statusDiv = document.createElement("div");
                statusDiv.classList.add("status", data.status);
                const text = data.status === "online" ? `User ${userId} (Online)` : `User ${userId} (Last seen: ${this.formatLastSeen(data.lastSeen)})`;
                userDiv.appendChild(statusDiv);
                userDiv.appendChild(document.createTextNode(text));
                this.userListElement.appendChild(userDiv);
            });
        }

        formatLastSeen(timestamp) {
            return new Date(timestamp).toLocaleString();
        }
    }

    // WebSocket Handlers
    socket.onopen = () => {
        console.log("Connected!");
        state.socketConnectionState = socket.readyState;
        updateSocketState();
    };

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "is_typing") {
            typingHandler.showTyping(data.user);
        } else if (data.type === "presence") {
            presenceHandler.updatePresence(data.userId, data.status, data.lastSeen);
        }
    };

    socket.onclose = () => {
        console.log("Disconnected...");
        state.socketConnectionState = socket.readyState;
        updateSocketState();
    };

    // DOM Elements
    const typingElement = document.querySelector("#typingIndicator");
    const typingHandler = new TypingHandler(typingElement);

    const userListElement = document.querySelector("#userList");
    const presenceHandler = new PresenceHandler(userListElement);

    // Event Listeners
    document.querySelector("#sendMessageButton").addEventListener("click", performSendingMessage);
    document.querySelector("#textInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            performSendingMessage();
        } else {
            isTyping();
        }
    });

    // Initial Render
    renderDialogs();
});


// Constants
const defaultDataStatus = { click: true, loading: 0.0, download: false };
const backendUrl = "http://127.0.0.1:8000";
const endpoints = {
    messages: `${backendUrl}/chat/messages/`,
    dialogs: `${backendUrl}/chat/dialogs/`,
    self: `${backendUrl}/chat/self/`,
    users: `${backendUrl}/chat/users/`,
    upload: `${backendUrl}/chat/upload/`
};

// Utility Functions
function getCookie(name) {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const cookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
}

function humanFileSize(size) {
    if (size === 0) return "0 B";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return (size / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function getPhotoString(userId, size = 150) {
    return `${backendUrl}/chat/users/${userId}/photo?size=${size}`;
}

function createOnDownload(uri, filename) {
    return new Promise(async (resolve, reject) => {
        console.log(`Downloading: ${uri}`);
        try {
            const response = await fetch(uri);
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.setAttribute("download", filename);
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 200);
            resolve();
        } catch (error) {
            reject(error.message);
        }
    });
}

function getSubtitleText(msg, outKey = "out", textKey = "text") {
    return msg ? (msg[outKey] ? `You: ${msg[textKey]}` : msg[textKey]) : "";
}

// Message Box Creation
function createMessageBox(message, type, isOutgoing = false, fileData = null) {
    const { sender, sender_username, text, random_id, file, dialog_id } = message;
    const avatar = getPhotoString(isOutgoing ? "self" : sender, 150);
    const position = isOutgoing ? "right" : "left";
    const dataStatus = fileData ? { ...defaultDataStatus } : null;
    const size = fileData ? humanFileSize(fileData.size) : null;
    const uri = fileData ? fileData.url : null;

    return {
        position,
        type,
        text: fileData ? fileData.name : text,
        title: isOutgoing ? "You" : sender_username,
        status: "waiting",
        avatar,
        date: new Date().toISOString(),
        data: {
            dialog_id: dialog_id || sender,
            message_id: random_id || Date.now(),
            out: isOutgoing,
            size,
            uri,
            status: dataStatus,
        },
        onDownload: fileData ? () => createOnDownload(fileData.url, fileData.name) : null,
    };
}

// Dialog Creation
function createDialogModel(dialog) {
    return {
        id: dialog.other_user_id,
        avatar: getPhotoString(dialog.other_user_id),
        avatarFlexible: true,
        statusColor: "",
        statusColorType: null,
        alt: dialog.username,
        title: dialog.username,
        date: dialog.last_message ? dialog.last_message.sent : dialog.created,
        subtitle: getSubtitleText(dialog.last_message),
        unread: dialog.unread_count,
    };
}

// WebSocket Message Handling
function handleWebSocketMessage(sock, message, callbacks) {
    try {
        const parsedMessage = JSON.parse(message);
        const { type, data } = parsedMessage;

        switch (type) {
            case "TextMessage":
                callbacks.addMessage(createMessageBox(data, "text"));
                break;
            case "FileMessage":
                callbacks.addMessage(createMessageBox(data, "file", false, data.file));
                break;
            default:
                console.warn(`Unhandled message type: ${type}`);
        }
    } catch (error) {
        console.error("Error processing WebSocket message", error);
    }
}

// Fetch Functions
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}`);

        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return null;
    }
}

async function fetchDialogs() {
    const data = await fetchData(endpoints.dialogs);
    return data ? data.data.map(createDialogModel) : [];
}

async function fetchMessages() {
    const data = await fetchData(endpoints.messages);
    return data
        ? data.data.map(message => createMessageBox(
              message,
              message.file ? "file" : "text",
              message.out,
              message.file
          ))
        : [];
}

// Example Usage
fetchDialogs().then(dialogs => console.log("Dialogs:", dialogs));
fetchMessages().then(messages => console.log("Messages:", messages));
