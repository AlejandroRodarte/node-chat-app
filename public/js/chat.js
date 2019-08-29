// we can access socket.io methods since we declared the /socket.io/socket.io.js file
// on index.html

// the client socket object
const socket = io();

// the server fires of an 'updatedCount' event, so we use socket.on() to register such event and
// we can react to it as clients
// the 'updatedCount' event emits a 'count' number, so we receive it as an argument in the callback
socket.on('countUpdated', (count) => {
    console.log('The count has been updated!' + count);
});

document.querySelector('#increment').addEventListener('click', (e) => {

    // use socket.emit() to emit an event from the client so the server can respond and execute some code
    // from the server side
    socket.emit('increment');

});