const http = require('http');

function testAPI() {
  const req = http.request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/leaderboard',
    method: 'GET'
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Leaderboard API Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (err) => {
    console.error('Error:', err.message);
  });

  req.end();

  // Also test stats API
  const statsReq = http.request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/leaderboard/stats',
    method: 'GET'
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\nStats API Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  statsReq.on('error', (err) => {
    console.error('Stats Error:', err.message);
  });

  statsReq.end();
}

// Wait a bit and then test
setTimeout(testAPI, 2000);
