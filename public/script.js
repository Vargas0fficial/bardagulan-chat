const socket = io();

// DOM elements
const userDetailsForm = document.getElementById('userDetailsForm');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('username');
const genderInput = document.getElementById('gender');
const joinChatButton = document.getElementById('joinChat');

const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messages');
const sendMessageButton = document.getElementById('sendMessage');
const leaveChatButton = document.getElementById('leaveChat');

let username = '';
let gender = '';

// When user joins the chat
joinChatButton.addEventListener('click', () => {
  username = usernameInput.value.trim();
  gender = genderInput.value.trim();

  if (username && gender) {
    socket.emit('join', { username, gender });
    userDetailsForm.style.display = 'none'; // Hide the form
    chatContainer.style.display = 'block';  // Show the chat container
  } else {
    alert('Please enter your name and select a gender');
  }
});

// Send message
sendMessageButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// Leave chat
leaveChatButton.addEventListener('click', () => {
  socket.emit('leave', { username, gender });
  chatContainer.style.display = 'none';  // Hide chat container
  userDetailsForm.style.display = 'block'; // Show the user form again
  usernameInput.value = ''; // Reset username input
  genderInput.value = ''; // Reset gender selection
});

// Send message function
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('message', { username, gender, message });
    messageInput.value = ''; // Clear input
  }
}

// Create message bubble
function createMessageBubble(data) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  if (data.username === 'System') {
    messageElement.classList.add('system-message');
    messageElement.textContent = data.message;
  } else {
    messageElement.classList.add('user-message');
    messageElement.innerHTML = `<strong>${data.username} (${data.gender})</strong>: ${data.message}`;
  }
  return messageElement;
}

// Listen for incoming messages
socket.on('message', (data) => {
  const messageElement = createMessageBubble(data);
  messagesContainer.appendChild(messageElement);

  // Scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Listen for previous messages when new user joins
socket.on('previousMessages', (messages) => {
  messages.forEach((msg) => {
    const messageElement = createMessageBubble(msg);
    messagesContainer.appendChild(messageElement);
  });

  // Scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
