# src/document_agents/multimodal_analysis_agent.py
import base64
from openai import OpenAI

class MultimodalAnalysisAgent:
    """An agent that analyzes image data using a multimodal LLM."""
    def __init__(self, model: str, api_key: str):
        # This agent uses a separate client initialization because the API call
        # structure for multimodal is different and doesn't always return JSON.
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        self.model = model

    def analyze_image(self, image_bytes: bytes, prompt_text: str) -> str | None:
        """
        Encodes image bytes and sends them with a text prompt to a multimodal LLM.
        """
        print("Agent [Analyzer]: Analyzing extracted image with multimodal LLM...")
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_text},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500
            )
            analysis_text = response.choices[0].message.content
            print("Agent [Analyzer]: Analysis complete.")
            return analysis_text
        except Exception as e:
            print(f"An error occurred during multimodal analysis: {e}")
            return None