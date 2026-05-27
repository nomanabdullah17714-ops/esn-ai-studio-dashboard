import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleRequest } from '../src/app.js';

async function withServer(fn) {
  const server = http.createServer(handleRequest);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('health endpoint reports ok', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, 'ok');
  });
});

test('JWT login unlocks dashboard metrics', async () => {
  await withServer(async (baseUrl) => {
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@esnconsultancy.com', password: 'esn-admin-2026' })
    });
    const loginBody = await login.json();
    assert.equal(login.status, 200);
    assert.ok(loginBody.token);

    const dashboard = await fetch(`${baseUrl}/api/dashboard`, { headers: { authorization: `Bearer ${loginBody.token}` } });
    const dashboardBody = await dashboard.json();
    assert.equal(dashboard.status, 200);
    assert.ok(dashboardBody.metrics.pipelineValue > 0);
    assert.ok(Array.isArray(dashboardBody.automations));
  });
});
