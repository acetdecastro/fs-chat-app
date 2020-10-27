const express = require('express');
const socketio = require('socket.io');
const morgan = require('morgan');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
app.use(morgan('dev'));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  const welcomeMessage = 'Welcome to the chat 🍔';

  socket.emit('receiveMessage', welcomeMessage);
  socket.broadcast.emit('aNewUserHasJoined', 'A new user has joined');

  socket.on('sendMessage', (messageFromClient) => {
    io.emit('receiveMessage', messageFromClient);
  });

  socket.on('disconnect', () => {
    io.emit('aUserHasDisconnected', 'A user has disconnected.');
  });

  socket.on('sendLocation', (coords) => {
    io.emit('aUserSentCoords', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
  });

  socket.on('aUserDeniedGeolocationRequest', (message) => {
    io.emit('aUserDeniedGeolocationRequest', message);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
