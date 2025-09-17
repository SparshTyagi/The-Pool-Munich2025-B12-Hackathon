# src/validation_agents/decomposer_agent.py
import json
from .base_agent import BaseAgent

class DecomposerAgent(BaseAgent):
    """An agent that breaks down a block of text into a list of atomic claims."""
    def decompose(self, text: str) -> list[str]:
        """Runs the decomposition task."""
        print("Agent [Decomposer]: Breaking down text into individual claims...")
        
        # --- LOGGING: Show the input text ---
        print("\n--- Decomposer INPUT ---")
        print(f"Text to decompose (first 500 chars):\n{text[:500]}...")
        print("------------------------\n")

        messages = [
            {
                "role": "system", 
                "content": """
                You are a meticulous assistant that extracts individual, verifiable claims from text. 
                Your goal is to identify specific, factual statements that can be fact-checked.
                
                Instructions:
                1. Prioritize claims containing numbers, statistics, percentages, or specific factual assertions.
                2. Ignore vague marketing language, aspirational statements, rhetorical questions, and section titles.
                3. Break down composite sentences into individual, atomic claims.
                
                Output a JSON object with a 'claims' key containing a list of strings.
                
                Example:
                Input Text: "Our new AI model is revolutionary. It processes 3 terabytes of data per second and reduces costs by 50%. This changes everything."
                Output JSON:
                {
                  "claims": [
                    "The AI model processes 3 terabytes of data per second.",
                    "The AI model reduces costs by 50%."
                  ]
                }
                """
            },
            {
                "role": "user", 
                "content": f"Extract the individual claims from the following text:\n\n---\n{text}\n---"
            }
        ]
        
        response = self._send_llm_request(messages)
        
        # --- LOGGING: Show the output claims ---
        print("\n--- Decomposer OUTPUT ---")
        if response and 'claims' in response:
            print(f"Extracted claims:\n{json.dumps(response['claims'], indent=2)}")
            print("Successfully decomposed into {} claims.".format(len(response['claims'])))
        else:
            print("No claims were extracted or an error occurred.")
        print("-------------------------\n")
        
        return response.get('claims', []) if response else []