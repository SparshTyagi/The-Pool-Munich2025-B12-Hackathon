# src/validation_agents/claim_classifier_agent.py
from .base_agent import BaseAgent

class ClaimClassifierAgent(BaseAgent):
    """Classifies claims as either needing external verification or internal consistency checks."""
    def classify_claims(self, claims: list[str], document_subject: str) -> dict:
        claims_str = "\n".join(f"- {c}" for c in claims)
        messages = [
            {"role": "system", "content": "You are a claim analyst. Your task is to classify claims into two types: 'EXTERNAL_VERIFIABLE' (facts about the world that can be checked online) and 'INTERNAL_CONSISTENCY' (statements about the product/company being presented). Return a JSON object with two keys, 'external' and 'internal', containing lists of the claims."},
            {"role": "user", "content": f"""
            The subject of this document is '{document_subject}'.
            Please classify the following claims:

            ---
            {claims_str}
            ---
            """}
        ]
        response = self._send_llm_request(messages)
        return response if response else {"external": [], "internal": []}