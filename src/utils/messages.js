const generateMessage = (text, username = 'Admin') => ({
  username,
  text,
  createdAt: new Date().getTime(),
});

const generateLocationMessage = (url, username = 'Admin') => ({
  username,
  url,
  createdAt: new Date().getTime(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
