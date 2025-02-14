const MessageTypes = {
    WentOnline: 1,
    WentOffline: 2,
    TextMessage: 3,
    FileMessage: 4,
    IsTyping: 5,
    MessageRead: 6,
    ErrorOccurred: 7,
    MessageIdCreated: 8,
    NewUnreadCount: 9,
    TypingStopped: 10,
};


// WebSocket connection
const chatSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/chat/'
);

// Handle WebSocket connection open
chatSocket.onopen = function (e) {
    console.log('WebSocket connection established.');
};

// Handle WebSocket errors
chatSocket.onerror = function (e) {
    console.error('WebSocket error:', e);
};

// Handle WebSocket connection close
chatSocket.onclose = function (e) {
    console.log('WebSocket connection closed:', e);
};

// Handle incoming WebSocket messages
chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log('WebSocket message received:', data);

    switch (data.msg_type) { 
        case MessageTypes.TextMessage:
            appendMessage(data);
            break;
        case MessageTypes.FileMessage:
            appendFileMessage(data);
            break;
        case MessageTypes.MessageRead:
            markMessageAsRead(data.message_id);
            break;
        case MessageTypes.ErrorOccurred:
            showError(data.error_message);
            break;
        default:
            console.warn('Unknown message type:', data.msg_type);
    }
};

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if the cookie name matches the requested name
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function generateRandomId() {
    return Math.floor(Math.random() * 1000000); 
}
// DOM elements for message input and send button
const textInput = document.getElementById('textInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const messageForm = document.getElementById('message-form');

// Prevent form submission
messageForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting and refreshing the page
    sendMessage(); // Call the sendMessage function
});

// Send message when the Send button is clicked
sendMessageButton.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent any default button behavior
    sendMessage(); // Call the sendMessage function
});

// Send message when Enter is pressed
textInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        sendMessage(); // Call the sendMessage function
    }
});

// Function to send a message
function sendMessage() {
    const message = textInput.value.trim();

    if (message) {
        // Send the message via WebSocket
        sendMessageViaWebSocket(message);

        // Clear the input field
        textInput.value = '';
    } else {
        showError('Message cannot be empty.');
    }
}

// Function to send a message via WebSocket
function sendMessageViaWebSocket(message) {
    const recipientId = getSelectedUserId(); // Get the selected user's ID
    const senderId = document.getElementById('loggedInUserId').dataset.userId; // Get the logged-in user's ID
    const randomId = generateRandomId();

    if (!recipientId) {
        showError('No recipient selected.');
        return;
    }

    if (chatSocket.readyState === WebSocket.OPEN) {
        // Send the message as a JSON object
        chatSocket.send(JSON.stringify({
            type: MessageTypes.TextMessage, // Use the correct message type
            text: message,
            user_pk: senderId, // Sender's UserProfile ID
            recipient_id: recipientId, // Recipient's UserProfile ID
            random_id: randomId,
        }));
    } else {
        showError('WebSocket connection is not open.');
    }
}


// Fetch and display conversations
function fetchConversations() {
    fetch('/chat/conversations/')
        .then(response => response.json())
        .then(data => {
            const chatList = document.getElementById('chatList');
            chatList.innerHTML = '';
            const descDiv = document.createElement('div');
            descDiv.classList.add('chat-title');
            descDiv.innerHTML = `
                <p>Messages</p>
                <a href="#" class="requests">1 requests</a>
            `;
            chatList.appendChild(descDiv);

            data.forEach(dialog => {
                const dialogElement = document.createElement('div');
                dialogElement.classList.add('chat-conversations');
                dialogElement.setAttribute('data-user-id', dialog.other_user_id);
                dialogElement.innerHTML = `
                    <img src="${dialog.profile_image || '/static/profile/default.jpg'}">
                    <div class="chat-info">
                        <div class="info-top">
                            <span class="username">${dialog.username}</span>
                            <time class="timestamp">${new Date(dialog.last_message_time).toLocaleTimeString()}</time>
                        </div>
                        <div class="info-bottom">
                            <p class="last-message">${dialog.last_message || ''}</p>
                            ${dialog.unread_count > 0 ? `<span class="unread-count">${dialog.unread_count}</span>` : ''}
                        </div>
                    </div>
                `;
                dialogElement.addEventListener('click', () => openChat(dialog.other_user_id));
                chatList.appendChild(dialogElement);
            });
        })
        .catch(error => console.error('Error fetching conversations:', error));
}

// Open chat with a specific user
function openChat(userId) {
    // Highlight the selected conversation
    const chatList = document.getElementById('chatList');
    Array.from(chatList.children).forEach(child => {
        child.classList.remove('active');
    });
    const selectedDialog = chatList.querySelector(`[data-user-id="${userId}"]`);
    if (selectedDialog) {
        selectedDialog.classList.add('active');
    }

    fetchMessages(userId);
    updateChatHeader(userId);
    markMessagesAsRead(userId);
}

// Fetch messages for a specific user
function fetchMessages(userId) {
    fetch(`/chat/messages/${userId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            return response.json();
        })
        .then(data => {
            const messageList = document.getElementById('messageList');
            messageList.innerHTML = ''; // Clear existing messages

            if (data.data && data.data.length > 0) {
                data.data.forEach(message => {
                    // Use the `out` field to determine the message class
                    const messageClass = message.out ? 'out' : 'in';
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message', messageClass);
                    messageElement.innerHTML = `
                        <p class="text">${message.text}</p>
                        <p class="timestamp">${new Date(message.sent * 1000).toLocaleTimeString()}</p>
                    `;
                    messageList.appendChild(messageElement);
                });
            }

            // Scroll to the bottom of the message list
            messageList.scrollTop = messageList.scrollHeight;
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            showError('Failed to load messages. Please try again.');
        });
}

// Update chat header with user info
function updateChatHeader(userId) {
    const userElement = document.querySelector(`#chatList [data-user-id="${userId}"]`);
    if (userElement) {
        const userImage = userElement.querySelector('img').src;
        const username = userElement.querySelector('.username').textContent;
        const userList = document.getElementById('userStatus');
        userList.innerHTML = `
            <img class="img" src="${userImage}" alt="${username}">
            <div class="info">
                <p class="name">${username}</p>
                <div id="typingIndicator">typing...</div>
            </div>
        `;
    }
}

// Append a new text message to the chat
function appendMessage(data) {
    const messageList = document.getElementById('messageList');
    const messageElement = document.createElement('div');
    const loggedInUserId = document.getElementById('loggedInUserId').dataset.userId;
    messageElement.classList.add('message', data.sender_id === loggedInUserId ? 'out' : 'in');  
    messageElement.innerHTML = `
        <p class="text">${data.text}</p>
        <p class="timestamp">${new Date(data.timestamp * 1000).toLocaleTimeString()}</p>
    `;
    messageList.appendChild(messageElement);

    // Scroll to the bottom of the message list
    messageList.scrollTop = messageList.scrollHeight;
}

// Append a new file message to the chat
async function appendFileMessage(data) {
    const messageList = document.getElementById('messageList');
    const messageElement = document.createElement('div');
    const loggedInUserId = document.getElementById('loggedInUserId').dataset.userId;
    messageElement.classList.add('message', data.sender_id === loggedInUserId ? 'out' : 'in');

    // Fetch the file URL using the file_id
    const fileUrl = await fetchFileUrl(data.file_id);
    messageElement.innerHTML = `
        <div class="file-message">
            <img src="${fileUrl}" alt="File" style="max-width: 200px;">
        </div>
        <p class="timestamp">${new Date(data.timestamp).toLocaleTimeString()}</p>
    `;
    messageList.appendChild(messageElement);

    // Scroll to the bottom of the message list
    messageList.scrollTop = messageList.scrollHeight;
}

async function fetchFileUrl(fileId) {
    const response = await fetch(`/chat/file/${fileId}/`);
    const data = await response.json();
    return data.file_url;
}
// Show typing indicator
function showTypingIndicator(userId) {
    const typingIndicator = document.getElementById('typingIndicator');
    if (getSelectedUserId() === userId) {
        typingIndicator.style.display = 'block';
    }
}

// Hide typing indicator
function hideTypingIndicator(userId) {
    const typingIndicator = document.getElementById('typingIndicator');
    if (getSelectedUserId() === userId) {
        typingIndicator.style.display = 'none';
    }
}

// Update online/offline status
function updateOnlineStatus(userId, isOnline) {
    const userElement = document.querySelector(`#chatList [data-user-id="${userId}"]`);
    if (userElement) {
        const statusIndicator = userElement.querySelector('.online-status');
        if (!statusIndicator) {
            const statusIndicator = document.createElement('span');
            statusIndicator.classList.add('online-status');
            userElement.querySelector('.chat-info').appendChild(statusIndicator);
        }
        statusIndicator.textContent = isOnline ? 'Online' : 'Offline';
        statusIndicator.style.color = isOnline ? 'green' : 'gray';
    }
}

// Mark messages as read
function markMessagesAsRead(userId) {
    fetch(`/chat/messages/${userId}/mark-read/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), 
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the UI to reflect that messages have been read
                const unreadCountElement = document.querySelector(`#chatList [data-user-id="${userId}"] .unread-count`);
                if (unreadCountElement) {
                    unreadCountElement.remove();
                }
            }
        })
        .catch(error => console.error('Error marking messages as read:', error));
}

document.getElementById('file-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/chat/upload/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                chatSocket.send(JSON.stringify({
                    type: MessageTypes.FileMessage, // Use the correct message type
                    file_id: data.file_id, // Send file_id instead of file_url
                    user_pk: document.getElementById('loggedInUserId').dataset.userId,
                    recipient_id: getSelectedUserId(),
                    random_id: generateRandomId(),
                }));
            }
        })
        .catch(error => console.error('Error uploading file:', error));
    }
});

// Show error message
function showError(errorMessage) {
    const errorElement = document.createElement('div');
    errorElement.classList.add('error');
    errorElement.textContent = errorMessage;
    document.body.appendChild(errorElement);

    // Remove the error after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Helper function to get the selected user ID
function getSelectedUserId() {
    const activeDialog = document.querySelector('#chatList .active');
    return activeDialog ? activeDialog.getAttribute('data-user-id') : null;
}

// Fetch conversations on page load
document.addEventListener('DOMContentLoaded', fetchConversations);