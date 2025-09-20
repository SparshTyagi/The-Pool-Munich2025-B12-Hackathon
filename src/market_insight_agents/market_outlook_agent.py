# src/market_insight_agents/market_outlook_agent.py

from Agents.base_agent import BaseAgent

class MarketOutlookAgent(BaseAgent):
    """Agent to analyze and provide the growth outlook for a given market segment."""

    def get_market_outlook(self, segment: str, region: str = "Global", timeframe: int = 5) -> dict:
        """
        Fetches projected market growth, opportunities, challenges, and explanations for the specified market segment.

        Args:
            segment (str): The market segment to analyze (e.g., FinTech, HealthTech, etc.).
            region (str): The geographical context (default is 'Global').
            timeframe (int): Future timeframe for the market outlook in years (default: 5 years).

        Returns:
            dict: A JSON object containing growth rate, potential, opportunities, challenges, confidence level, and explanation.
        """
        print(f"Agent [MarketOutlook]: Analyzing outlook for segment: '{segment}' in region: '{region}' with timeframe: '{timeframe}' years.")

        try:
            # Prompt for the LLM
            prompt = f"""
            You are a market research expert. Based on the market segment '{segment}', region '{region}', and the specified timeframe of '{timeframe} years', provide the following:

            1. Growth Rate (CAGR): Expected compound annual growth rate over the specified timeframe.
            2. Future Potential: Describe the market's overall growth potential and highlight why this segment is poised for growth.
            3. Opportunities: Identify major growth drivers such as technological advancements, consumer trends, or economic factors.
            4. Challenges: Highlight barriers to growth such as regulations, competition, or funding issues.
            5. Confidence Level: Indicate the confidence level of this forecast (High, Medium, or Low).
            6. Explanation: Provide reasoning behind the provided growth rate, opportunities, and challenges. Mention key assumptions or data sources where applicable.

            Provide your response in the following JSON format:
            {{
                "growth_rate": "<value> (e.g., 25% CAGR over the next 5 years)",
                "future_potential": "<Description of growth potential>",
                "opportunities": ["<List of growth drivers>"],
                "challenges": ["<List of challenges>"],
                "confidence": "<High | Medium | Low>",
                "explanation": "Detailed reasoning and key assumptions behind the outlook forecast."
            }}
            """

            # Prepare LLM request messages
            messages = [
                {"role": "system", "content": "You are a market growth analyst specializing in forecasting market trends."},
                {"role": "user", "content": prompt},
            ]

            # Send the request to the LLM using _send_llm_request from BaseAgent
            response = self._send_llm_request(messages)

            # Validate and return the response
            if response:
                print(f"Agent [MarketOutlook]: Successfully retrieved market outlook data: {response}")
                return response
            else:
                raise ValueError("No response from LLM.")
        except Exception as e:
            print(f"Agent [MarketOutlook] Error: {e}")
            return {
                "growth_rate": None,
                "future_potential": None,
                "opportunities": [],
                "challenges": [],
                "confidence": "Error",
                "explanation": "Unable to fetch market outlook due to an error."
            }