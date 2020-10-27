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

io.on('connection', () => {
  console.log('New WebSocket connection');
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
