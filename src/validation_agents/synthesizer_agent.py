# src/validation_agents/synthesizer_agent.py
from .base_agent import BaseAgent

class ContentSynthesizerAgent(BaseAgent):
    """
    An agent that combines raw text and a visual analysis into a single,
    coherent block of text for further processing.
    """
    def synthesize(self, native_text: str, visual_analysis: str) -> str | None:
        """
        Uses an LLM to intelligently merge the two content streams.
        """
        print("Agent [Synthesizer]: Merging native text and visual analysis...")
        messages = [
            {"role": "system", "content": "You are a data synthesizer. Your job is to combine two pieces of information from a presentation slide—a highly accurate but poorly formatted raw text dump, and a high-level visual analysis—into a single, clean, and structured block of text. The raw text is the source of truth for all textual and numerical data. The visual analysis provides context about layout and non-text elements. Prioritize the raw text for all content."},
            {"role": "user", "content": f"""
            Please synthesize the following information into a single, coherent text block.

            **RAW TEXT (Source of Truth):**
            ---
            {native_text}
            ---

            **VISUAL ANALYSIS (Context):**
            ---
            {visual_analysis}
            ---
            
            **SYNTHESIZED CONTENT:**
            """}
        ]
        # This is a simple task, so we don't need a JSON response
        try:
            response = self.client.chat.completions.create(
                extra_headers=self.extra_headers,
                model=self.model,
                messages=messages
            ).choices[0].message.content
            print("Agent [Synthesizer]: Synthesis complete.")
            return response
        except Exception as e:
            print(f"Error during content synthesis: {e}")
            return native_text # Fallback to the most accurate source