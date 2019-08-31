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
const $sidebar = document.querySelector('#sidebar');

// target templates
const msgTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// getting query string param values
// Qs.parse() parses the query string from the URl into an object
// location.search provides the raw query string to parse
// we use destructuring to fetch each param value individually
// this code runs whenever the chat.html is loaded
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// autoscroll logic
const autoscroll = () => {

    // 1. get the new message element from the messages parent element
    const $newMessage = $messages.lastElementChild;

    // 2. determine how tall the message is (including the margin)

    // 2a. get the styles from the new message element
    const newMessageStyles = getComputedStyle($newMessage);

    // 2b. from the styles, get the margin we applied to the element (just margin bottom)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);

    // 2c. get new message height (with margin added)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // 3. get the height of the messages container that IS VISIBLE through the browser
    const visibleHeight = $messages.offsetHeight;

    // 4. get the FULL HEIGHT of the messages container (including the one we can't see through the browser)
    const containerHeight = $messages.scrollHeight;

    // 5. get the amount of distance we have scrolled from the top of the messages container
    // if we are on the top of the scroll, scrollTop returns 0
    // if we are on the bottom of the scroll, its value with the visibleHeight added would match the previous container height
    const scrollOffset = $messages.scrollTop + visibleHeight;

    // 6. test if the user is at the bottom of the scroll
    // if the current scroll offset plus the new message height match in pixels the new container height, it means the user
    // is at the bottom of the scroll
    if (scrollOffset + newMessageHeight === containerHeight) {
        $messages.scrollTop = $messages.scrollHeight;
    }
    
};

// remember, this code runs whenever chat.html is loaded, so we immediately emit a 'join'
// event for the server to listen with the username and room to join
socket.emit('join', { username, room }, (err) => {

    // callback called by server for ackwnoledgement
    // if an error was provided: redirect user to index.html
    if (err) {
        alert(err);
        location.href = '/';
    }

});

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
socket.on('message', ({ username, msg, createdAt }) => {

    console.log(msg);

    // get html from the message template, pass an object which identifies
    // the dynamic variables to receive some value
    // we use the moment library to format the date we get as an input
    const html = Mustache.render(msgTemplate, { username, msg, createdAt: moment(createdAt).format('h:mm a') });

    // insert the rendered html into the messages div
    $messages.insertAdjacentHTML('beforeend', html);

    // finally, autoscroll
    autoscroll();

});

// listen for the 'locationMessage' event
// render the template passing the location url and the created at timestamp as dynamic data
// finally, autoscroll
socket.on('locationMessage', ({ username, url, createdAt }) => {
    const html = Mustache.render(locationTemplate, { username, url, createdAt: moment(createdAt).format('h:mm a') });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

// listen for 'roomData' from server; render html based on the sidebar template and use dynamic content
// given by the server (the room name and the array of users)
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users });
    $sidebar.innerHTML = html;
});