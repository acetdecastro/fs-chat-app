const users = [];

const addUser = ({ id, username, room }) => {
  // Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required.',
    };
  }

  // Clean the data
  const _username = username.trim().toLowerCase();
  const _room = room.trim().toLowerCase();

  // Check for existing user
  const existingUser = users.find((user) => user.room === _room && user.username === _username);

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use.',
    };
  }

  // Store user
  const user = { id, username: _username, room: _room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return {
      error: 'No user found with the given id.',
    };
  }

  return users.splice(index, 1)[0];
};

const getUser = (id) => {
  const _user = users.find((user) => user.id === id);

  if (!_user) {
    return {
      error: 'No user found with the given id.',
    };
  }

  return _user;
};

const getUsersInRoom = (room = '') => {
  const _room = room.trim().toLowerCase();
  const _users = users.filter((user) => user.room === _room);

  if (!_users) {
    return {
      error: `There are no users in ${_room}`,
    };
  }

  return _users;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
