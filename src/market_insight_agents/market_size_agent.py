# src/market_insight_agents/market_size_agent.py

from Agents.base_agent import BaseAgent


class MarketSizeAgent(BaseAgent):
    """Agent to determine TAM, SAM, SOM, and classify the market size using LLM."""

    def get_market_size(self, segment: str, region: str = "Global") -> dict:
        """
        Fetches TAM, SAM, SOM, market classification, and explanation for the specified market segment and region.

        Args:
            segment (str): The market segment (e.g., FinTech, HealthTech, etc.).
            region (str): The region in focus (default is 'Global').

        Returns:
            dict: A dictionary containing TAM, SAM, SOM, classification, explanation, and optional confidence level.
        """
        print(f"Agent [MarketSize]: Analyzing segment: '{segment}' in region: '{region}'")

        try:
            # Prompt for the LLM
            prompt = f"""
            You are a market research analyst. Based on the market segment '{segment}' and region '{region}', provide the following:

            1. Total Addressable Market (TAM): The overall market size in monetary terms (e.g., 500B, 5T).
            2. Serviceable Available Market (SAM): The portion of TAM targeted by businesses in this category.
            3. Serviceable Obtainable Market (SOM): The realistically achievable market share based on competition and scale.
            4. Classification: Categorize the TAM as Small (<1B), Medium (1B-5B), or Large (>5B).
            5. Confidence Level: Indicate the confidence level of the data (e.g., High, Medium, Low).
            6. Explanation: Provide a brief explanation for how these numbers and categorizations were determined. Include key assumptions.

            Return the data as a JSON object:
            {{
                "TAM": "<value> (e.g., 500B, 5T)",
                "SAM": "<value> (e.g., 50B)",
                "SOM": "<value> (e.g., 10B)",
                "classification": "<Small | Medium | Large>",
                "confidence": "<High | Medium | Low>",
                "explanation": "Detailed reasoning on how TAM, SAM, SOM were calculated with key assumptions."
            }}
            """

            # Prepare request for the LLM
            messages = [
                {"role": "system", "content": "You are an analytical assistant specializing in market insights."},
                {"role": "user", "content": prompt}
            ]

            # Send the request to the LLM using BaseAgent's _send_llm_request
            response = self._send_llm_request(messages)

            # Validate and return the response
            if response:
                print(f"Agent [MarketSize]: Successfully retrieved market size data: {response}")
                return response
            else:
                raise ValueError("No response from LLM.")
        except Exception as e:
            print(f"Agent [MarketSize] Error: {e}")
            return {
                "TAM": None,
                "SAM": None,
                "SOM": None,
                "classification": "Error: Unable to fetch market size data.",
                "confidence": "Error",
                "explanation": "No explanation available due to an error."
            }