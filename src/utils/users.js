const users = [];

// add a user
const addUser = ({ id, username, room }) => {

    // sanitize the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // check if args were provided; return error if fail
    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        };
    }

    // find user with matching names and in the same room
    const foundUser = users.find(user => user.room === room && user.username === username);

    // user found: attempting to join user with already occupied username; throw error
    if (foundUser) {
        return {
            error: `Username already exists in room ${room}`
        };
    }

    // create a new user and push to array
    const user = { id, username, room };
    users.push(user);

    return { user } ;

};

// delete user
const removeUser = (id) => {

    // find user by id in array
    const index = users.findIndex(user => user.id === id);

    // user not found: throw error
    if (index === -1) {
        return {
            error: 'User was not found.'
        };
    }

    // delete user with splice(), since we delete only one element
    // and splice() returns an array of deleted elements, we have access to it
    // on index 0
    return { user: users.splice(index, 1)[0] };

};

// get user by id: use find to get user and return undefined if not found (behavior of the find method)
const getUser = (id) => {
    const foundUser = users.find(user => user.id === id);
    return foundUser;
};

// get users by room: use filter to get only users where they match the given room (returns empty array if no matches exist)
const getUsersInRoom = (room) => {
    const roomUsers = users.filter(user => user.room === room);
    return roomUsers;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};