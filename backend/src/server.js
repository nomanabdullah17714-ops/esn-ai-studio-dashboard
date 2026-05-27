import http from 'node:http';
import { handleRequest } from './app.js';
import { env } from './config/env.js';

const server = http.createServer(handleRequest);
server.listen(env.port, () => {
  console.log(`ESN Node API listening on :${env.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
