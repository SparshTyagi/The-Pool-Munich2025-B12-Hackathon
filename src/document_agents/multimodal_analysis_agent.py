# src/document_agents/multimodal_analysis_agent.py
import base64
from openai import OpenAI

class MultimodalAnalysisAgent:
    """An agent that analyzes and synthesizes slide content from both text and image sources."""
    def __init__(self, model: str, api_key: str):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        self.model = model

    def analyze_slide_content(self, image_bytes: bytes, extracted_text: str | None) -> str | None:
        """
        Analyzes a slide's image and text together to create a comprehensive, unified transcription.
        """
        print("Agent [Analyzer]: Synthesizing extracted text with multimodal image analysis...")
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            # If no raw text was extracted, we provide a different instruction.
            if extracted_text:
                prompt_text = f"""
                You are a comprehensive document analysis expert. Your task is to synthesize information for a single presentation slide from two sources: the raw extracted text and an image of the slide. Your goal is to create a complete and accurate transcription of ALL information present.

                Instructions:
                1.  Use the "Raw Extracted Text" below as the primary source. It is the most reliable transcription of standard text.
                2.  Carefully analyze the "Slide Image" to identify any information that is MISSING from the raw text. This includes text within logos (e.g., "GitHub," "Financial Times"), text in charts, icons, or any words the text extractor might have missed.
                3.  Combine both sources into a single, cohesive block of text that represents EVERYTHING on the slide. Do not add any commentary or analysis; your output should be only the final, complete transcription.

                --- Raw Extracted Text ---
                {extracted_text}
                --- End of Raw Extracted Text ---
                """
            else:
                prompt_text = "You are an expert Optical Character Recognition (OCR) system. Transcribe ALL text visible in the provided image of a presentation slide. This includes text in logos, charts, and any other graphical elements. Provide only the transcribed text without any additional commentary."

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_text},
                            {
                                "type": "image_url",
                                "image_url": { "url": f"data:image/png;base64,{base64_image}" }
                            }
                        ]
                    }
                ],
                max_tokens=2000
            )
            analysis_text = response.choices[0].message.content
            print("Agent [Analyzer]: Comprehensive analysis and synthesis complete.")
            return analysis_text
        except Exception as e:
            print(f"An error occurred during multimodal synthesis: {e}")
            return None