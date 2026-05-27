import crypto from 'node:crypto';
import { env } from '../config/env.js';

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(input) {
  return crypto.createHmac('sha256', env.jwtSecret).update(input).digest('base64url');
}

export function signUser(user) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ sub: user.id, email: user.email, role: user.role, name: user.name, exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 }));
  const signature = sign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token) {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const expected = sign(`${header}.${payload}`);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
  return claims;
}
