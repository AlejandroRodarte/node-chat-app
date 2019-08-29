const express = require('express');
const path = require('path');

const app = express();

// use environment port (when deploying on Heroku) or port 3000 if it's undefined
const port = process.env.PORT || 3000;

// path to the public/ dir where we will have our static assets
const publicDir = path.join(__dirname, '..', 'public');

// set the dir for Express to acknowledge
app.use(express.static(publicDir));

app.listen(port, () => {
    console.log(`Server up and running in port ${port}.`);
});