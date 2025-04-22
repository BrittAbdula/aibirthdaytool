// test-proxy.js
const https = require('https');

https.get('https://www.google.com', (res) => {
  console.log('Status code:', res.statusCode);
  res.on('data', () => {});
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});

