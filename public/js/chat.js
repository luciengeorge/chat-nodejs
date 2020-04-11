const socket = io(); // available because it is loaded after the socket.io script in index.html

socket.on('message', (message) => {
  console.log(message);
});

const form = document.getElementById('message-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const messageInput = event.target.elements.message
  socket.emit('sendMessage', messageInput.value, (error) => {
    if (error) {
      return console.log(error)
    }
    console.log(`the message was delivered`);
  });
});

const locationCta = document.getElementById('send-location');

locationCta.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
      console.log('location has been shared');
    });
  });
});
