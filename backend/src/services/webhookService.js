import { env } from '../config/env.js';
import { addActivity } from '../data/store.js';

const providerUrls = {
  make: env.integrations.make,
  n8n: env.integrations.n8n,
  zapier: env.integrations.zapier
};

export function providerStatus() {
  return Object.entries(providerUrls).map(([provider, url]) => ({ provider, configured: Boolean(url), status: url ? 'ready' : 'missing_env' }));
}

export async function dispatchWebhook(provider, event, payload) {
  const target = providerUrls[provider];
  if (!target) {
    addActivity('webhook', `${provider} webhook simulated for ${event}`, { provider, event });
    return { provider, event, delivered: false, simulated: true, reason: 'Provider URL is not configured' };
  }

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-esn-event': event },
    body: JSON.stringify({ event, payload, sentAt: new Date().toISOString() })
  });

  addActivity('webhook', `${provider} webhook delivered for ${event}`, { provider, event, status: response.status });
  return { provider, event, delivered: response.ok, status: response.status };
}
