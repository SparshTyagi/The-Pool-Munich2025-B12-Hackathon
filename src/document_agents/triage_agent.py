# src/document_agents/triage_agent.py
import sys
import os

# Ensure the base agent can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validation_agents.base_agent import BaseAgent

class TriageAgent(BaseAgent):
    """
    An agent that quickly determines if a page contains verifiable claims
    or is just a title/divider slide, to save processing credits.
    """
    def contains_verifiable_claims(self, extracted_text: str) -> dict:
        """
        Analyzes text from a slide to classify it.
        """
        print("Agent [Triage]: Assessing if page contains verifiable claims...")
        messages = [
            {"role": "system", "content": "You are a document analyst. Your task is to determine if a piece of text from a presentation slide contains factual, verifiable claims (like statistics, data points, or specific assertions) or if it is a title, section divider, or purely aspirational marketing statement. Respond with a JSON object containing two keys: 'contains_verifiable_claims' (boolean) and 'reason' (string)."},
            {"role": "user", "content": f"Analyze the following text from a slide:\n\n---\n{extracted_text}\n---"}
        ]
        response = self._send_llm_request(messages)
        if response:
            print(f"Agent [Triage]: Assessment complete. Verifiable claims: {response.get('contains_verifiable_claims')}")
            return response
        return {"contains_verifiable_claims": False, "reason": "Failed to analyze triage request."}