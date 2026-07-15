#!/usr/bin/env node
/* Dependency-free local launcher for LifeSim v24.2.1. */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = __dirname;
const HOST = '127.0.0.1';
const FIRST_PORT = 8765;
const LAST_PORT = 8789;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

function safeFile(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent((urlPath || '/').split('?')[0]); }
  catch { return null; }
  if (decoded === '/') decoded = '/index.html';
  const file = path.resolve(ROOT, `.${decoded}`);
  return file === ROOT || file.startsWith(`${ROOT}${path.sep}`) ? file : null;
}

function openBrowser(url) {
  const platform = process.platform;
  const command = platform === 'win32' ? 'cmd' : platform === 'darwin' ? 'open' : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => {});
  child.unref();
}

function makeServer() {
  return http.createServer((req, res) => {
    const file = safeFile(req.url);
    if (!file) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
      return;
    }
    fs.stat(file, (statError, stat) => {
      if (statError || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      });
      const stream = fs.createReadStream(file);
      stream.on('error', () => res.destroy());
      stream.pipe(res);
    });
  });
}

function listen(port) {
  if (port > LAST_PORT) {
    console.error('No free local port found between 8765 and 8789.');
    process.exitCode = 1;
    return;
  }
  const server = makeServer();
  server.once('error', error => {
    if (error.code === 'EADDRINUSE' || error.code === 'EACCES') listen(port + 1);
    else {
      console.error(`Could not start LifeSim: ${error.message}`);
      process.exitCode = 1;
    }
  });
  server.listen(port, HOST, () => {
    const url = `http://127.0.0.1:${port}/index.html`;
    console.log(`LifeSim v24.2.1 is running locally at ${url}`);
    console.log('Keep this window open while playing. Press Ctrl+C to stop.');
    setTimeout(() => openBrowser(url), 700);
  });
}

listen(FIRST_PORT);
