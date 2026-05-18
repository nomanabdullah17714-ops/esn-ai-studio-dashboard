import fs from 'node:fs';

if (fs.existsSync('.env')) {
  const lines = fs.readFileSync('.env', 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    process.env[key] ??= valueParts.join('=').replace(/^['"]|['"]$/g, '');
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  pythonAgentUrl: process.env.PYTHON_AGENT_URL ?? 'http://localhost:8090',
  invoiceTaxRate: Number(process.env.INVOICE_TAX_RATE ?? 0.08),
  integrations: {
    openai: process.env.OPENAI_API_KEY,
    meta: process.env.META_ACCESS_TOKEN,
    metaPixelId: process.env.META_PIXEL_ID,
    discordBot: process.env.DISCORD_BOT_TOKEN,
    discordWebhook: process.env.DISCORD_WEBHOOK_URL,
    make: process.env.MAKE_WEBHOOK_URL,
    n8n: process.env.N8N_WEBHOOK_URL,
    zapier: process.env.ZAPIER_WEBHOOK_URL
  }
};
