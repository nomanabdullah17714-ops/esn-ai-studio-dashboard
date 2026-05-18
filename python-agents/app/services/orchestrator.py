from app.agents.base import BusinessAgent

AGENTS = [
    BusinessAgent('strategy', 'Revenue architecture', 'Rank initiatives by ROI, speed, and delivery risk.'),
    BusinessAgent('crm', 'Lead conversion', 'Score leads, recommend next-best action, and sync pipeline events.'),
    BusinessAgent('content', 'AI content generation', 'Produce audience-specific hooks, proof, and CTA variants.'),
    BusinessAgent('ops', 'Client onboarding', 'Convert intake into owners, SLAs, checklists, and webhook triggers.'),
    BusinessAgent('finance', 'Invoice automation', 'Generate billing milestones, invoice drafts, tax checks, and reminders.'),
]

async def orchestrate(goal: str, context: dict) -> dict:
    agent_results = [agent.run(goal, context) for agent in AGENTS]
    return {
        'goal': goal,
        'mode': 'python-multi-agent',
        'agents': agent_results,
        'nextActions': [
            'Create or update the CRM record',
            'Trigger Make.com/n8n/Zapier pipelines based on lifecycle stage',
            'Generate client-facing content and internal delivery checklist',
            'Schedule dashboard review of revenue, delivery, and invoice metrics',
        ],
        'riskControls': ['Human approval for outbound campaigns', 'JWT-protected API access', 'Secrets loaded from environment only'],
        'context': context,
    }
