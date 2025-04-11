const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 3000 });
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor WebSocket ouvindo na porta ${port}`);
});
const users = new Map();

server.on('connection', (socket) => {
  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'join') {
        users.set(socket, { username: message.username });
        broadcast({ type: 'user-joined', username: message.username });
      }

      if (message.type === 'position') {
        const user = users.get(socket);
        if (user) {
          user.position = message.position;
          broadcast({
            type: 'update-position',
            username: user.username,
            position: message.position,
          });
        }
      }

      if (message.type === 'media') {
        const user = users.get(socket);
        if (user) {
          broadcast({
            type: 'media',
            username: user.username,
            media: message.media,
          });
        }
      }

    } catch (err) {
      console.error('Invalid message received:', err);
    }
  });

  socket.on('close', () => {
    const user = users.get(socket);
    if (user) {
      broadcast({ type: 'user-left', username: user.username });
      users.delete(socket);
    }
  });
});

function broadcast(message) {
  const json = JSON.stringify(message);
  for (const client of server.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

console.log('✅ WebSocket server is running...');
