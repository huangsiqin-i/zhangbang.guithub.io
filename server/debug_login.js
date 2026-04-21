// 模拟登录请求
const http = require('http');

const data = JSON.stringify({
  username: 'admin',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('响应体:', body);
  });
});

req.on('error', (e) => {
  console.error('请求遇到问题:', e.message);
});

req.write(data);
req.end();