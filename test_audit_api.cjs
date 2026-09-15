const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    
    // Now fetch audit
    const req2 = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/case/ANV-2026-573755/audit',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res2 => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log("AUDIT API STATUS:", res2.statusCode);
        console.log("AUDIT API RESPONSE:", data2);
      });
    });
    req2.end();
  });
});
req.write(JSON.stringify({ email: 'police@anveshak.com', password: 'TestPolice@123' }));
req.end();
