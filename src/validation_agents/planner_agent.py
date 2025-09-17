# src/validation_agents/planner_agent.py
from .base_agent import BaseAgent

class PlannerAgent(BaseAgent):
    """An agent that creates an expert research plan to verify or disprove claims."""
    def plan(self, claims: list[str], document_context: str | None = None) -> list[str]:
        """Creates an efficient list of investigative search queries."""
        print("Agent [Planner]: Creating an efficient, context-aware search plan...")
        claims_str = "\n".join(f"- {c}" for c in claims)
        
        # --- MODIFICATION START: A much more sophisticated prompt for investigative queries ---
        messages = [
            {
                "role": "system", 
                "content": """
                You are an expert research analyst and fact-checker. Your job is to convert a list of claims into a concise and effective list of search engine queries. The goal of your queries is to find primary sources that can definitively VERIFY or DISPROVE the claims.

                Your strategy must be:
                1.  **Rephrase Claims as Questions:** Do not search for the literal claim text. Instead, turn the claim into a neutral, fact-finding question.
                2.  **Isolate Universal Statistics:** If a claim is a general statistic (e.g., "50 million startups per year," "200+ papers published per minute"), your query should be broad and focus on finding the authoritative source for that number. IGNORE the specific document context in these cases to avoid confirmation bias.
                3.  **Use Context for Specific Claims:** ONLY use the document context (e.g., company name, topic) if the claim is highly specific to that subject and would be ambiguous without it.
                4.  **Combine Logically:** If multiple claims can be answered by one broader query, combine them.

                Output a JSON object with a 'queries' key containing a list of your generated search query strings.
                """
            },
            {
                "role": "user", 
                "content": f"""
                **Document Context:**
                "{document_context}"

                **Claims to Verify:**
                ---
                {claims_str}
                ---

                **Example of Correct Thinking:**
                - Claim: "200+ research papers are published every minute."
                - Context: "Startup named Butterfly focusing on European innovation."
                - Analysis: This is a universal statistic. The context is irrelevant and will contaminate the search. I need to find the global rate of academic publishing.
                - Correct Query: "how many scientific papers are published per minute globally" OR "scientific publishing statistics 2025"

                **Example 2 of Correct Thinking:**
                - Claim: "Our revenue grew by 50% last quarter."
                - Context: "Startup named Butterfly focusing on European innovation."
                - Analysis: This claim is specific to the company. The context is essential.
                - Correct Query: "Butterfly startup revenue growth Q3 2025"

                Based on this strategy, generate the optimal search queries for the claims provided above.
                """
            }
        ]
        # --- MODIFICATION END ---
        
        response = self._send_llm_request(messages)
        return response.get('queries', []) if response else []