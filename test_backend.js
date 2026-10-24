import app from './backend/server.js';
import http from 'http';
import mongoose from 'mongoose';

const server = http.createServer(app);
server.listen(5099, async () => {
  console.log('Test server listening on port 5099');

  const testEndpoints = [
    { method: 'OPTIONS', path: '/auth/login', headers: { Origin: 'https://shopease-8fpe.vercel.app', 'Access-Control-Request-Method': 'POST' } },
    { method: 'OPTIONS', path: '/auth/google', headers: { Origin: 'https://shopease-8fpe.vercel.app', 'Access-Control-Request-Method': 'POST' } },
    { method: 'OPTIONS', path: '/products', headers: { Origin: 'https://shopease-8fpe.vercel.app', 'Access-Control-Request-Method': 'GET' } },
    { method: 'OPTIONS', path: '/categories', headers: { Origin: 'https://shopease-8fpe.vercel.app', 'Access-Control-Request-Method': 'GET' } },
    { method: 'GET', path: '/health', headers: { Origin: 'https://shopease-8fpe.vercel.app' } },
    { method: 'GET', path: '/products', headers: { Origin: 'https://shopease-8fpe.vercel.app' } },
    { method: 'GET', path: '/categories', headers: { Origin: 'https://shopease-8fpe.vercel.app' } },
    { method: 'GET', path: '/api/products', headers: { Origin: 'https://shopease-8fpe.vercel.app' } },
    { method: 'GET', path: '/api/categories', headers: { Origin: 'https://shopease-8fpe.vercel.app' } }
  ];

  for (const ep of testEndpoints) {
    try {
      const res = await fetch('http://localhost:5099' + ep.path, {
        method: ep.method,
        headers: ep.headers
      });
      const allowOrigin = res.headers.get('access-control-allow-origin');
      const text = await res.text();
      console.log(`[${ep.method}] ${ep.path} -> Status: ${res.status}, CORS Origin: ${allowOrigin}, Body: ${text.slice(0, 100)}`);
    } catch (e) {
      console.error(`[${ep.method}] ${ep.path} -> ERROR:`, e.message);
    }
  }

  await mongoose.connection.close();
  server.close(() => {
    console.log('All tests finished successfully.');
    process.exit(0);
  });
});
