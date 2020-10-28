// eslint-disable-next-line no-undef
const socket = io();

// HTML Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInputText = document.querySelector('input');
const $messageFormSubmmitButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#sendLocationButton');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const $messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const $locationTemplate = document.querySelector('#locationTemplate').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML;

// Options
// eslint-disable-next-line
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom, 10);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Socket event listeners
socket.on('receiveMessage', (message) => {
  // eslint-disable-next-line no-undef
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    // eslint-disable-next-line no-undef
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (message) => {
  // eslint-disable-next-line no-undef
  const html = Mustache.render($locationTemplate, {
    username: message.username,
    url: message.url,
    // eslint-disable-next-line no-undef
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room: _room, users }) => {
  // eslint-disable-next-line no-undef
  const html = Mustache.render($sidebarTemplate, {
    room: _room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormSubmmitButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.messageInputText.value;

  socket.emit('sendMessage', message, () => {
    $messageFormSubmmitButton.removeAttribute('disabled');
    $messageFormInputText.value = '';
    $messageFormInputText.focus();
  });
});

$sendLocationButton.addEventListener('click', () => {
  $sendLocationButton.setAttribute('disabled', 'disabled');

  if (!navigator.geolocation) {
    // eslint-disable-next-line no-alert
    return alert('Geolocation is not support by your browser.');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    console.log('test');
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }, () => {
      $sendLocationButton.removeAttribute('disabled');
    });
  }, (error) => {
    if (error.PERMISSION_DENIED) {
      $sendLocationButton.removeAttribute('disabled');
      socket.emit('userDeniedGeolocationRequest');
    }
  }, { enableHighAccuracy: true });

  return undefined;
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    // eslint-disable-next-line no-alert
    alert(error);
    // eslint-disable-next-line no-restricted-globals
    location.href = '/';
  }
});
