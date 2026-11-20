// One command setup: copies .env files and installs both apps. Works on Windows, macOS, Linux.
const { execSync } = require('child_process');
const fs = require('fs'); const path = require('path');
const root = path.join(__dirname, '..');
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: 'inherit' });
if (Number(process.versions.node.split('.')[0]) < 18) { console.error('Node 18 or newer is required. Download from https://nodejs.org'); process.exit(1); }
const copy = (from, to) => { const t = path.join(root, to); if (!fs.existsSync(t)) { fs.copyFileSync(path.join(root, from), t); console.log('created', to); } };
copy('backend/.env.example', 'backend/.env');
copy('frontend/.env.example', 'frontend/.env.local');
console.log('\nInstalling packages (first time takes a few minutes)...\n');
run('npm install'); run('npm install', path.join(root, 'backend')); run('npm install', path.join(root, 'frontend'));
console.log('\nDone! Start the app with:  npm run dev\nThen open http://localhost:3000\n');
