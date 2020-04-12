const socket = io(); // available because it is loaded after the socket.io script in index.html

const $form = document.getElementById('message-form');
const $messageInput = document.getElementById('message');
const $formSubmit = document.getElementById('submit-cta');
const $locationCta = document.getElementById('send-location');
const $messages = document.getElementById('messages');

// templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationTemplate, {
    location
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  $formSubmit.setAttribute('disabled', 'disabled');

  socket.emit('sendMessage', $messageInput.value, (error) => {
    $formSubmit.removeAttribute('disabled');
    $messageInput.value = '';
    $messageInput.focus();

    if (error) {
      return console.log(error)
    }
    console.log(`the message was delivered`);
  });
});

$locationCta.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser')
  }
  $locationCta.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
      console.log('location has been shared');
      $locationCta.removeAttribute('disabled');
    });
  });
});
