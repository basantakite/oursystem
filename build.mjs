import fs from 'fs';
import path from 'path';

console.log('Building Election Ops Application...');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy index.html
fs.copyFileSync('index.html', 'dist/index.html');
console.log('Copied index.html -> dist/index.html');

if (fs.existsSync('public')) {
  fs.copyFileSync('index.html', 'public/index.html');
  console.log('Synced index.html -> public/index.html');
}

// Copy sw.js
if (fs.existsSync('sw.js')) {
  fs.copyFileSync('sw.js', 'dist/sw.js');
  console.log('Copied sw.js -> dist/sw.js');
  if (fs.existsSync('public')) {
    fs.copyFileSync('sw.js', 'public/sw.js');
  }
}

// Copy manifest.json
if (fs.existsSync('manifest.json')) {
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  console.log('Copied manifest.json -> dist/manifest.json');
  if (fs.existsSync('public')) {
    fs.copyFileSync('manifest.json', 'public/manifest.json');
  }
}

// Copy icons directory
if (fs.existsSync('icons')) {
  fs.cpSync('icons', 'dist/icons', { recursive: true });
  console.log('Copied icons/ -> dist/icons/');
}

console.log('Build completed successfully!');
