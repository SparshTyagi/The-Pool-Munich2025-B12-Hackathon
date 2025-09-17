# agents/planner_agent.py
from .base_agent import BaseAgent

class PlannerAgent(BaseAgent):
    """An agent that creates an efficient search query plan from a list of claims."""
    def plan(self, claims: list[str]) -> list[str]:
        """Creates an efficient list of search queries."""
        print("Agent [Planner]: Creating an efficient search plan...")
        claims_str = "\n".join(f"- {c}" for c in claims)
        messages = [
            {"role": "system", "content": "You are a research strategist. Your job is to create a concise and efficient list of search engine queries to validate a list of claims. Combine related claims into a single query to minimize searches. Output a JSON object with a 'queries' key containing a list of strings."},
            {"role": "user", "content": f"Based on the following claims, what are the optimal search queries?\n\n---\n{claims_str}\n---"}
        ]
        response = self._send_llm_request(messages)
        return response.get('queries', []) if response else []