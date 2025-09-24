const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));  // Serve static files (frontend)

let users = []; // Store connected users
let messages = []; // Store all messages

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send previous messages to the new user
  socket.emit('previousMessages', messages);

  // Handle when a user joins
  socket.on('join', (data) => {
    const { username, gender } = data;
    users.push({ socketId: socket.id, username, gender });
    console.log(`${username} (${gender}) joined the chat`);

    // Notify everyone that a user joined
    io.emit('message', {
      username: 'System',
      gender: '',
      message: `${username} has joined the chat.`,
    });
  });

  // Handle incoming messages
  socket.on('message', (data) => {
    // Add message to the messages array
    messages.push(data);
    
    // Broadcast the message to everyone
    io.emit('message', data);
  });

  // Handle leave event
  socket.on('leave', (data) => {
    const user = users.find((u) => u.socketId === socket.id);
    if (user) {
      console.log(`${user.username} disconnected`);
      io.emit('message', {
        username: 'System',
        gender: '',
        message: `${user.username} has left the chat.`,
      });

      // Remove user from the list
      users = users.filter((u) => u.socketId !== socket.id);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = users.find((u) => u.socketId === socket.id);
    if (user) {
      console.log(`${user.username} disconnected`);
      io.emit('message', {
        username: 'System',
        gender: '',
        message: `${user.username} has left the chat.`,
      });

      // Remove user from the list
      users = users.filter((u) => u.socketId !== socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
