// we can access socket.io methods since we declared the /socket.io/socket.io.js file
// on index.html

// the client socket object
const socket = io();

// target the form and the input
const msgForm = document.querySelector('#msg-form');
const msg = document.querySelector('#msg');

// event on submission: emit 'sendMessage' event with the input value
msgForm.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('sendMessage', msg.value);
});

// listen for the 'message' event and log the message
socket.on('message', (msg) => {
    console.log(msg);
});