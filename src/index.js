const path = require('path'); // no need to install it
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app); // refactor for websockets
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');


app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {

  socket.on('join', ({ username, room}, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    // emits to current client
    socket.emit('message', generateMessage(user.username, 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage(user.username, 'has joined the room')); // emits to all connected users except current user
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('profanity is not allowed')
    }

    io.to(user.room).emit('message', generateMessage(user.username, message)); // emits to all the connected users
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage(user.username, 'has left'));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
