// we can access socket.io methods since we declared the /socket.io/socket.io.js file
// on index.html

// the client socket object
const socket = io();

// target required elements
const $msgForm = document.querySelector('#msg-form');
const $msg = document.querySelector('#msg');
const $msgSubmit = document.querySelector('#msg-submit')
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// target templates
const msgTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

// event on submission: emit 'sendMessage' event with the input value
$msgForm.addEventListener('submit', e => {

    e.preventDefault();

    // disable the submit button
    $msgSubmit.setAttribute('disabled', 'disabled');

    // send message for server to process
    // besides the message content, we add a callback argument so the server can call it
    // and we can receive feedback from it
    socket.emit('sendMessage', $msg.value, err => {

        // re-enable the submission button
        $msgSubmit.removeAttribute('disabled');

        // clear the message input and focus cursor on the input
        $msg.value = '';
        $msg.focus();

        // the callback, check for a string error message due to profanity
        if (err) {
            return console.log(err);
        }

        // no profanity: inform the message has been delivered
        console.log('Message delivered!');

    });

});

// when the 'send location' button is clicked
$sendLocation.addEventListener('click', () => {

    // check if the geolocation API is supported
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    // disable location submit button
    $sendLocation.setAttribute('disabled', 'disabled');

    // get the current position
    navigator.geolocation.getCurrentPosition(position => {

        // emit a 'sendLocation' event for the server to listen and send
        // an object with the latitude and longitude
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {

            // callback called by the server: acknowledge client location has been
            // processed and shared properly
            console.log('Location shared!');

            // re-enable location submit button
            $sendLocation.removeAttribute('disabled');

        });

    });

});

// listen for the 'message' event and log the message
socket.on('message', ({ msg, createdAt }) => {

    console.log(msg);

    // get html from the message template, pass an object which identifies
    // the dynamic variables to receive some value
    // we use the moment library to format the date we get as an input
    const html = Mustache.render(msgTemplate, { msg, createdAt: moment(createdAt).format('h:mm a') });

    // insert the rendered html into the messages div
    $messages.insertAdjacentHTML('beforeend', html);

});

// listen for the 'locationMessage' event
// render the template passing the location url and the created at timestamp as dynamic data
socket.on('locationMessage', ({ url, createdAt }) => {
    const html = Mustache.render(locationTemplate, { url, createdAt: moment(createdAt).format('h:mm a') });
    $messages.insertAdjacentHTML('beforeend', html);
});