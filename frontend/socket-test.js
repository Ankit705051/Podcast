// Socket chat smoke test against the rebuilt backend.
// Usage: node socket-test.js
const { io } = require('socket.io-client');

const API = 'http://127.0.0.1:3000/api/v1';
const SESSION_ID = process.argv[2]; // live session id
const EMAIL = process.argv[3] || 'fe_test1@example.com';
const PASSWORD = process.argv[4] || 'password123';

async function login() {
  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('login failed: ' + JSON.stringify(data));
  return data.token;
}

async function joinRest(token) {
  const res = await fetch(`${API}/sessions/${SESSION_ID}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: '{}',
  });
  return res.json();
}

async function main() {
  if (!SESSION_ID) { console.error('pass session id'); process.exit(1); }
  const token = await login();
  console.log('logged in');

  const join = await joinRest(token);
  console.log('REST join:', join.success, join.message || '');

  const socket = io('http://127.0.0.1:3000', {
    auth: { token },
    transports: ['polling', 'websocket'],
  });

  socket.on('connect', () => {
    console.log('socket connected, joining session...');
    socket.emit('join-session', SESSION_ID);
  });
  socket.on('session-state', (s) => console.log('session-state:', JSON.stringify(s)));
  socket.on('error', (e) => console.log('socket error:', JSON.stringify(e)));
  socket.on('receive-message', (m) => console.log('RECEIVED:', JSON.stringify(m).slice(0, 300)));
  socket.on('new-message', (m) => console.log('NEW-MSG:', JSON.stringify(m).slice(0, 300)));
  socket.on('connect_error', (e) => console.log('connect_error:', e.message));

  setTimeout(() => {
    console.log('sending message...');
    socket.emit('send-message', { sessionId: SESSION_ID, message: 'hello from socket test', type: 'text' });
  }, 1500);

  setTimeout(() => { socket.disconnect(); process.exit(0); }, 5000);
}

main().catch((e) => { console.error(e); process.exit(1); });
