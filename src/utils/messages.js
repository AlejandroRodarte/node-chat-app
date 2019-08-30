// generate object with message and timestamp
const generateMessage = (msg) => {
    return {
        msg,
        createdAt: new Date().getTime()
    }
};

// generate object with location url and timestamp
const generateLocationMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
};

// export functions
module.exports = {
    generateMessage,
    generateLocationMessage
};