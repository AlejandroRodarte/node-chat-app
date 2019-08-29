const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

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

    // emit welcome message for particular user
    socket.emit('message', 'Welcome!');

    // use socket.broadcast() to emit an event to all clients but that particular connection
    socket.broadcast.emit('message', 'A new user has entered!');

    // wait for particular client to send message and broadcast for all clients to see
    socket.on('sendMessage', msg => {
        io.emit('message', msg);
    });

    // listen for the 'sendLocation' event and emit a new message for all users to know
    socket.on('sendLocation', ({ latitude, longitude }) => {
        io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`);
    });

    // register event for when that particular user disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!');
    });

});

// make the server listen on the assigned port
server.listen(port, () => {
    console.log(`Server up and running in port ${port}.`);
});