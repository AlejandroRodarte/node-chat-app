const generateMessage = (msg) => {
    return {
        msg,
        createdAt: new Date().getTime()
    }
};

module.exports = {
    generateMessage
};