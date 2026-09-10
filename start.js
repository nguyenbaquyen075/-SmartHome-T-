const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Đang khởi động ĐIỆN NƯỚC CAMERA (Backend & Frontend)...');

// Backend: Express API (cổng 5001)
const backend = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Frontend: Vite dev server (cổng 5174)
const frontend = spawn('npm', ['run', 'dev', '--', '--host'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
