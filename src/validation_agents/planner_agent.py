# src/validation_agents/planner_agent.py
from .base_agent import BaseAgent

class PlannerAgent(BaseAgent):
    """An agent that creates an efficient search query plan from a list of claims, using document context."""
    def plan(self, claims: list[str], document_context: str | None = None) -> list[str]: # MODIFIED signature
        """Creates an efficient list of search queries."""
        print("Agent [Planner]: Creating an efficient, context-aware search plan...")
        claims_str = "\n".join(f"- {c}" for c in claims)
        
        # MODIFIED prompt to include document_context
        context_instruction = (
            f"IMPORTANT CONTEXT: These claims are about '{document_context}'. "
            "Ensure your search queries are highly specific to this subject to avoid ambiguity."
        ) if document_context else ""

        messages = [
            {"role": "system", "content": "You are a research strategist. Your job is to create a concise and efficient list of search engine queries to validate a list of claims. Combine related claims into a single query to minimize searches. Use the provided context to make your queries highly specific. Output a JSON object with a 'queries' key containing a list of strings."},
            {"role": "user", "content": f"""
            {context_instruction}

            Based on the following claims, what are the optimal search queries?

            ---
            {claims_str}
            ---
            """}
        ]
        response = self._send_llm_request(messages)
        return response.get('queries', []) if response else []