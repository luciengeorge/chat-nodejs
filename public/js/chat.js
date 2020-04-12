const socket = io(); // available because it is loaded after the socket.io script in index.html

const $form = document.getElementById('message-form');
const $messageInput = document.getElementById('message');
const $formSubmit = document.getElementById('submit-cta');
const $locationCta = document.getElementById('send-location');
const $messages = document.getElementById('messages');
const $sidebar = document.getElementById('sidebar');

// templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sideBarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  const visibleHeight = $messages.offsetHeight;
  const messagesContainerHeight = $messages.scrollHeight;
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (messagesContainerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }

};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    username: message.username,
    createdAt: moment(message.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationTemplate, {
    url: location.url,
    username: location.username,
    createdAt: moment(location.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  $formSubmit.setAttribute('disabled', 'disabled');

  socket.emit('sendMessage', $messageInput.value, (error) => {
    $formSubmit.removeAttribute('disabled');
    $messageInput.value = '';
    $messageInput.focus();

    if (error) {
      return alert(error);
    }
  });
});

$locationCta.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser')
  }
  $locationCta.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
      $locationCta.removeAttribute('disabled');
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users
  });
  $sidebar.innerHTML = html;
});
