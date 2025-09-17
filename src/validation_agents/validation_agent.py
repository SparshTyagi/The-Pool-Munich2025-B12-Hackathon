# agents/validation_agent.py
import json
from base_agent import BaseAgent

class ValidationAgent(BaseAgent):
    """An agent that performs the final synthesis and validation of claims."""
    def validate(self, claims: list[str], context: str, sources: list[dict]) -> dict:
        """Synthesizes all information to produce a final verdict on each claim."""
        print("Agent [Validation]: Synthesizing all information for the final verdict...")
        claims_str = "\n".join(f"- {c}" for c in claims)
        sources_str = json.dumps(sources, indent=2)
        messages = [
            {"role": "system", "content": "You are a meticulous fact-checking analyst. Your task is to validate a list of claims based ONLY on the provided context and source reputability evaluations. Output a JSON object with a 'validation_results' key containing a list of objects, one for each claim."},
            {"role": "user", "content": f"""
            Please validate each of the following claims based on the provided context and source information. For each claim, provide a conclusion, a summary, and cite the supporting evidence directly from the context.

            **CLAIMS TO VALIDATE:**
            {claims_str}

            **EVALUATED SOURCES:**
            {sources_str}

            **FULL CONTEXT FROM SOURCES:**
            {context}

            **INSTRUCTIONS:**
            For each claim, create a JSON object with the following keys:
            - "claim": The original claim string.
            - "conclusion": "SUPPORTED", "CONTRADICTED", "SPECULATIVE", or "INSUFFICIENT_INFORMATION".
            - "summary": Your detailed analysis of the claim based on the evidence.
            - "evidence": A list of direct quotes from the context that informed your conclusion, including the source URL for each quote.
            """}
        ]
        return self._send_llm_request(messages)