const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Đang khởi động CameraTD Pro Store (Backend & Frontend)...');

// Start Express Server
const server = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Start Vite Client
const client = spawn('npm', ['run', 'dev', '--', '--host'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});
