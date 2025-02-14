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
