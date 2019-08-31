// generate object with message and timestamp and username
const generateMessage = (username, msg) => {
    return {
        username,
        msg,
        createdAt: new Date().getTime()
    }
};

// generate object with location url and timestamp and username
const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
};

// export functions
module.exports = {
    generateMessage,
    generateLocationMessage
};