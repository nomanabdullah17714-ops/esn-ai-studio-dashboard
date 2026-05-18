import { env } from '../config/env.js';
import { providerStatus } from './webhookService.js';

export function getIntegrationStatus() {
  return {
    openai: { configured: Boolean(env.integrations.openai), capabilities: ['content', 'analysis', 'agent-planning'] },
    meta: { configured: Boolean(env.integrations.meta), pixelConfigured: Boolean(env.integrations.metaPixelId), capabilities: ['lead-ads', 'retargeting', 'conversion-events'] },
    discord: { configured: Boolean(env.integrations.discordBot || env.integrations.discordWebhook), capabilities: ['alerts', 'community-intake', 'agent-notifications'] },
    webhooks: providerStatus()
  };
}
