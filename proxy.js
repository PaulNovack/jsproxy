const http = require('http');
const httpProxy = require('http-proxy');

// Create a new proxy server with the target set to the OpenAI endpoint
const proxy = httpProxy.createProxyServer({
  target: 'https://api.openai.com', // The upstream server
  changeOrigin: true,               // Changes the Host header to match the target
  secure: false                     // Disables strict SSL checking (useful for self-signed)
});

// Extra debugging: log request details before forwarding
proxy.on('proxyReq', (proxyReq, req, res, options) => {
  console.log('--- New Request ---');
  console.log('Forwarding path:', proxyReq.path);
  console.log('Authorization header:', proxyReq.getHeader('authorization'));
  console.log('Content-Type header:', proxyReq.getHeader('content-type'));
  console.log('-------------------');
});

// Extra debugging: log response status code from the upstream (OpenAI)
proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log('--- Upstream Response ---');
  console.log('Response status from OpenAI:', proxyRes.statusCode);
  console.log('--------------------------');
});

// Catch and log proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(502);
  res.end('Bad Gateway');
});

// Create the local server that uses our proxy
const server = http.createServer((req, res) => {
  proxy.web(req, res, {}, (err) => {
    console.error('Proxy web error:', err);
    res.writeHead(502);
    res.end('Bad Gateway');
  });
});

// Start listening
server.listen(8089, () => {
  console.log('Proxy listening on http://localhost:8089');
});

