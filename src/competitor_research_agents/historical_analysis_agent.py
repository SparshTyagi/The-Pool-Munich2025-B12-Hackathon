from Agents.base_agent import BaseAgent

class HistoricalAnalysisAgent(BaseAgent):
    """Agent to analyze historical trends and key events of competitors."""

    def find_historical_similar_companies(self, companies: list[str], years: int) -> dict:
        """
        Fetches historical analysis for the given competitors.

        Args:
            companies (list): List of competitor company names.
            years (int): Time range (in years) for historical analysis.

        Returns:
            dict: Insights and explanation on historical trends of competitors.
        """
        print(f"Agent [HistoricalAnalysis]: Analyzing historical data for companies: {companies} over the last {years} years.")

        try:
            # Prompt construction
            prompt = f"""
            You are an expert market researcher. Analyze the following companies' key historical trends (revenue growth, events, etc.) over the past {years} years:

            Companies:
            {", ".join(companies)}

            Provide your response as a JSON object:
            {{
                "historical_insights": [
                    {{
                        "company": "<company name>",
                        "last_x_years_revenue_growth": "<percentage>",
                        "notable_events": ["<list of important events>"]
                    }}
                ],
                "explanation": "Summarize how the historical insights were derived."
            }}
            """
            messages = [
                {"role": "system", "content": "You are assisting with historical trend analysis."},
                {"role": "user", "content": prompt}
            ]
            response = self._send_llm_request(messages)

            # Validate and return response
            if response:
                print(f"Agent [HistoricalAnalysis]: Successfully retrieved historical insights: {response}")
                return response
            else:
                raise ValueError("No response from LLM.")
        except Exception as e:
            print(f"Agent [HistoricalAnalysis] Error: {e}")
            return {
                "historical_insights": [],
                "explanation": "An error occurred while fetching historical trends."
            }