const WebSocket = require('ws');
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let users = [];

wss.on('connection', function connection(ws) {
    console.log('Usuário conectado');

    ws.on('message', function incoming(data) {
        const message = JSON.parse(data);
        if (message.type === 'join') {
            users.push({ id: message.id, name: message.name });
        }

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => {
        console.log('Usuário desconectado');
    });
});

server.listen(port, () => {
    console.log(`Servidor WebSocket rodando na porta ${port}`);
});
