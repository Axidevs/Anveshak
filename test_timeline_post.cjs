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
    
    // Now post timeline
    const req2 = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/case/ANV-2026-573755/timeline',
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, res2 => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log("TIMELINE POST API STATUS:", res2.statusCode);
        console.log("TIMELINE POST API RESPONSE:", data2);
      });
    });
    req2.write(JSON.stringify({
      action: 'WITNESS OVERVIEW',
      description: 'WITNESS DETAILS',
      date: '2026-09-15'
    }));
    req2.end();
  });
});
req.write(JSON.stringify({ email: 'police@anveshak.com', password: 'TestPolice@123' }));
req.end();
