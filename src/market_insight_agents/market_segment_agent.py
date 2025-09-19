# src/market_insight_agents/market_segment_agent.py

from Agents.base_agent import BaseAgent

class MarketSegmentAgent(BaseAgent):
    """Agent to identify the market segment in which a startup operates."""

    def identify_segment(self, description: str) -> dict:
        """
        Identifies the market segment of the startup based on its description.

        Args:
            description (str): A brief description of the startup (e.g., focus, product, or service).

        Returns:
            dict: A detailed JSON object containing the identified market segment and explanation.
        """
        print(f"Agent [MarketSegment]: Analyzing description to identify market segment: {description}")

        try:
            # Construct the prompt for the LLM
            prompt = f"""
            You are an expert market analyst. Based on the following startup description, identify the primary market segment 
            it belongs to (e.g., FinTech, HealthTech, EdTech, etc.). 

            Provide the reasoning behind the identification based on keywords, themes, or known market trends in the description.
            Your response should be in the following JSON format:
            {{
                "segment": "The identified primary market segment",
                "sub_segments": ["Related sub-segments, if any"],
                "examples": ["Examples of companies in this market"],
                "keywords": ["Key relevant keywords extracted from the description"],
                "explanation": "Detailed reasoning behind why the segment was chosen based on the description."
            }}

            Description:
            "{description}"
            """

            # Prepare LLM request messages
            messages = [
                {"role": "system", "content": "You are a professional market analyst specialized in identifying business market segments."},
                {"role": "user", "content": prompt},
            ]

            # Send the prompt to the LLM via the inherited _send_llm_request method
            response = self._send_llm_request(messages)

            # Check if the LLM response is valid
            if response:
                print(f"Agent [MarketSegment]: Retrieved market segment data: {response}")
                return response
            else:
                raise ValueError("No response from the LLM")
        except Exception as e:
            print(f"Agent [MarketSegment] Error: {e}")
            return {
                "segment": None,
                "sub_segments": None,
                "examples": None,
                "keywords": None,
                "explanation": "An error occurred while fetching the market segment."
            }