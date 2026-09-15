const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/case/ANV-2026-573755/audit',
  method: 'GET',
};
const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
});
req.end();
