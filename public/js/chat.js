// we can access socket.io methods since we declared the /socket.io/socket.io.js file
// on index.html

// the client socket object
const socket = io();

// target the form and the input
const msgForm = document.querySelector('#msg-form');
const msg = document.querySelector('#msg');
const sendLocation = document.querySelector('#send-location');

// event on submission: emit 'sendMessage' event with the input value
msgForm.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('sendMessage', msg.value);
});

// when the 'send location' button is clicked
sendLocation.addEventListener('click', () => {

    // check if the geolocation API is supported
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    // get the current position
    navigator.geolocation.getCurrentPosition(position => {

        // emit a 'sendLocation' event for the server to listen and send
        // an object with the latitude and longitude
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

    });

});

// listen for the 'message' event and log the message
socket.on('message', (msg) => {
    console.log(msg);
});