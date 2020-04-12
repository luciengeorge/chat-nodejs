const path = require('path'); // no need to install it
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app); // refactor for websockets
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');


app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('new websocket connection');
  socket.emit('message', 'Welcome!'); // emits to current client
  socket.broadcast.emit('message', 'a new user has joined'); // emits to all connected users except current user
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('profanity is not allowed')
    }

    io.emit('message', message); // emits to all the connected users
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('message', 'a user has left');
  });
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
