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

let count = 0;

// connection() callback runs each time a new client is connected
// where the 'socket' argument contains information about that client connection
io.on('connection', (socket) => {

    // similar to Angular, emit() a 'countUpdated' for the subscribers (clients) to listen to
    // and run some code on their side
    // the second argument is the data to send with the event trigger and we can access it on
    // the client callback function in its on() method
    socket.emit('countUpdated', count);

    // socket.on() to listen when the particular client socket emits an 'increment' event
    socket.on('increment', () => {

        // increment the count
        count++;

        // emit the new count value to ALL clients with io.emit()
        io.emit('countUpdated', count);

    });

});

// make the server listen on the assigned port
server.listen(port, () => {
    console.log(`Server up and running in port ${port}.`);
});