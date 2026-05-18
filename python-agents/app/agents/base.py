from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class BusinessAgent:
    name: str
    focus: str
    directive: str

    def run(self, goal: str, context: dict[str, Any]) -> dict[str, Any]:
        context_keys = ', '.join(sorted(context.keys())) or 'no extra context'
        return {
            'agent': self.name,
            'focus': self.focus,
            'recommendation': f'{self.directive} Goal: {goal}. Inputs reviewed: {context_keys}.',
            'confidence': 0.91,
        }
