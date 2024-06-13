const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  connectionStateRecovery: {},
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users = {}; // объект для хранения пользователей и их socket.id

io.on('connect', (socket) => {
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Пример: отправка сообщения определенному пользователю
  socket.on('sendMessageToUser', (data) => {
    const { userId, message } = data;
    const recipientSocketId = users[userId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message', message);
      console.log(`Sent message to user ${userId}: ${message}`);
    } else {
      console.log(`User ${userId} not found`);
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected and removed`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
