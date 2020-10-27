// eslint-disable-next-line no-undef
const socket = io();
const messageForm = document.querySelector('#messageForm');
const sendLocationButton = document.querySelector('#sendLocationButton');

socket.on('receiveMessage', (message) => {
  console.log(message);
});

socket.on('aNewUserHasJoined', (message) => {
  console.log(message);
});

socket.on('aUserHasDisconnected', (message) => {
  console.log(message);
});

socket.on('aUserSentCoords', (url) => {
  console.log(url);
});

socket.on('aUserDeniedGeolocationRequest', (message) => {
  console.log(message);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = e.target.elements.messageInputText.value;

  socket.emit('sendMessage', message);
});

sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    // eslint-disable-next-line no-alert
    return alert('Geolocation is not support by your browser.');
  }

  return navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  }, (error) => {
    if (error.PERMISSION_DENIED) {
      socket.emit('aUserDeniedGeolocationRequest', 'User denied the request for Geolocation.');
    }
  }, { enableHighAccuracy: true });
});
