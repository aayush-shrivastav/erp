import http from 'http';
const server = http.createServer((req, res) => {
  res.end('ok');
});
server.listen(9876, () => {
  console.log('Server bound successfully on 9876');
  process.exit(0);
});
server.on('error', (err) => {
  console.error('Failed to bind:', err);
  process.exit(1);
});
