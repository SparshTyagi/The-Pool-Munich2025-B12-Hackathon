from .base_agent import BaseAgent

class DecomposerAgent(BaseAgent):
    """An agent that breaks down a block of text into a list of atomic claims."""
    def decompose(self, text: str) -> list[str]:
        """Runs the decomposition task."""
        print("Agent [Decomposer]: Breaking down text into individual claims...")
        messages = [
            {"role": "system", "content": "You are a helpful assistant that extracts individual, verifiable claims from a block of text. Output a JSON object with a 'claims' key containing a list of strings."},
            {"role": "user", "content": f"Extract the individual claims from the following text:\n\n---\n{text}\n---"}
        ]
        response = self._send_llm_request(messages)
        return response.get('claims', []) if response else []