import http from 'node:http';
import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Media Player backend listening on port ${PORT}`);
});

export default server;
