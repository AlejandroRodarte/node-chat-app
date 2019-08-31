const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// express app
const app = express();

// use the Express app to create an http server
const server = http.createServer(app);

// bind socket.io with the http server to enable WebSockets
const io = socketio(server);

// use environment port (when deploying on Heroku) or port 3000 if it's undefined
const port = process.env.PORT || 3000;

// path to the public/ dir where we will have our static assets
const publicDir = path.join(__dirname, '..', 'public');

// set the dir for Express to acknowledge
app.use(express.static(publicDir));

// connection() callback runs each time a new client is connected
// where the 'socket' argument contains information about that client connection
io.on('connection', (socket) => {

    // wait for particular client to send message
    // besides the payload, we declared on chat.js a callback to run from here
    socket.on('sendMessage', (msg, callback) => {

        const filter = new Filter();

        // check for profanity: if exists, use the callback to run client code
        // with an error message
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!');
        }

        // get user and just access its room and username property
        const { username, room } = getUser(socket.id);

        // no profanity: emit the message to everyone and call the callback without any argument
        // just for the sake of acknowledgement
        // now send also the username as part of the final generated message
        io.to(room).emit('message', generateMessage(username, msg));
        callback();

    });

    // listen for the 'sendLocation' event and emit a new 'locationMessage' event for all users to know
    // besides the payload, we set up a callback on the client for acknowledgement
    // use the helper method to send an object with the url and a timestamp
    socket.on('sendLocation', ({ latitude, longitude }, callback) => {

        // get user and just access its room and username property
        const { username, room } = getUser(socket.id);

        // this is a message from a particular user, so attach as username the one we fetched
        io.to(room).emit('locationMessage', generateLocationMessage(username, `https://google.com/maps?q=${latitude},${longitude}`));
        callback();

    });

    // register event for when that particular user disconnects
    socket.on('disconnect', () => {

        // remove the user from the users model through the socket id
        const { error, user } = removeUser(socket.id);

        // if we get the deleted user, it means the operation was successful, so use the deleted user's
        // room to emit a message to those roome users that the user left
        // this is a system message, so set the username as 'admin'
        if (user) {

            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left!`));

            // emit data on 'roomData' event: an object with the room name and the users in that room
            // after deleting the user
            io.to(user.room).emit('roomData', { 
                room: user.room,
                users: getUsersInRoom(user.room)
            });

        }

    });

    // listener for the 'join' event by the client: comes with the username and room to join
    socket.on('join', ({ username, room }, callback) => {

        // attempt to add the user; the id comes from the socket object itself
        // remember, this method returns either an 'error' or a 'user' object
        const { error, user } = addUser({ id: socket.id, username, room });

        // if an error was indeed thrown, call the client's callback with that error
        if (error) {
            return callback(error);
        }

        // use socket.join() to use that client socket and attach it to that particular room
        socket.join(user.room);

        console.log(user.username);

        // emit welcome message for particular user (now with the timestamp)
        // this is a system message, so attach 'admin' as username
        socket.emit('message', generateMessage('admin', 'Welcome!'));

        // use socket.broadcast().to() to emit an event to all clients in that room but that particular connection
        // this is a system message, so attach 'admin' as username
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined!`));

        // emit data on 'roomData' event: an object with the room name and the users in that room
        // after adding the user
        io.to(user.room).emit('roomData', { 
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        // acknowledge the client
        callback();

    });

});

// make the server listen on the assigned port
server.listen(port, () => {
    console.log(`Server up and running in port ${port}.`);
});