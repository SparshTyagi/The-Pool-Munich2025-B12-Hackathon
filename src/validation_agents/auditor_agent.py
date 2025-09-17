# src/validation_agents/auditor_agent.py
from .base_agent import BaseAgent

class AuditorAgent(BaseAgent):
    """
    An agent that reviews claims classified as 'internal' to find any that
    contain quantifiable, external facts that should be re-routed for verification.
    """
    def audit_claims(self, internal_claims: list[dict], document_subject: str) -> dict:
        """
        Identifies which claims from the internal knowledge base need external fact-checking.
        """
        print("Agent [Auditor]: Auditing internally classified claims for verifiable facts...")
        
        # Prepare a simple list of claims for the prompt
        claims_text_list = [c['claim'] for c in internal_claims]
        if not claims_text_list:
            print("Agent [Auditor]: No internal claims to audit.")
            return {"claims_to_verify": []}

        claims_str = "\n".join(f"- {claim}" for claim in claims_text_list)
        
        messages = [
            {"role": "system", "content": "You are a meticulous financial auditor and fact-checker. You will be given a list of claims a company made about itself. Your task is to identify which of these claims, despite being about the company's product or vision, contain specific, quantifiable metrics or facts about the external world that absolutely must be verified. For example, 'Our system processes 50 million data points' or 'We improve efficiency by 300%' must be verified. However, 'Our system is efficient' or 'The slide is titled...' do not need external verification. Return a JSON object with a single key, 'claims_to_verify', containing a list of the exact claim strings that need fact-checking."},
            {"role": "user", "content": f"""
            The subject of the document is '{document_subject}'.
            Please audit the following claims and identify which ones contain specific, verifiable numbers or facts about the world:

            ---
            {claims_str}
            ---
            """}
        ]
        response = self._send_llm_request(messages)
        claims_to_verify = response.get('claims_to_verify', []) if response else []
        print(f"Agent [Auditor]: Audit complete. Flagged {len(claims_to_verify)} claims for re-verification.")
        return claims_to_verify