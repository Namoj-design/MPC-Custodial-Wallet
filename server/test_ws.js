const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001/ws');

ws.on('open', function open() {
  console.log('Connected to server');
  ws.send(JSON.stringify({ type: 'ping' }));
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString());
  if (data.toString().includes('pong')) {
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => {
    console.error('Error connecting:', err);
    process.exit(1);
});

setTimeout(() => {
    console.error('Timeout connecting');
    process.exit(1);
}, 2000);
