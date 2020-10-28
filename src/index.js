const express = require('express');
const socketio = require('socket.io');
const morgan = require('morgan');
const Filter = require('bad-words');
const http = require('http');
const path = require('path');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
app.use(morgan('dev'));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ username, room }, callback) => {
    const welcomeMessage = `Welcome to room ${room}!`;
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('receiveMessage', generateMessage(welcomeMessage));
    socket.broadcast.to(user.room).emit('receiveMessage', generateMessage(`${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    return callback();
  });

  socket.on('sendMessage', (messageFromClient, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(messageFromClient)) {
      return callback('Profanity is not allowed.');
    }

    io.to(user.room).emit('receiveMessage', generateMessage(messageFromClient, user.username));
    return callback('Message delivered.');
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('receiveMessage', generateMessage(`${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on('userDeniedGeolocationRequest', () => {
    const user = getUser(socket.id);
    const message = `${user.username} denied the request for Geolocation.`;
    io.to(user.room).emit('receiveMessage', generateMessage(message));
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;

    io.to(user.room).emit('locationMessage', generateLocationMessage(url, user.username));

    // Send acknowledgement to client
    return callback('Location shared.');
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
