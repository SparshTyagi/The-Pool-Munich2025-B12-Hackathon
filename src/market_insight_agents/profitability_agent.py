# src/market_insight_agents/profitability_agent.py

from Agents.base_agent import BaseAgent

class ProfitabilityAgent(BaseAgent):
    """Agent to determine the profitability and financial viability of a startup."""

    def get_profitability(self, startup_data: dict, market_data: dict, context: str = None) -> dict:
        """
        Evaluates the profitability and financial viability of the startup based on its data and market context.

        Args:
            startup_data (dict): Contains startup-specific financial and business data,
                                 such as industry, revenue model, profitability metrics, etc.
            market_data (dict): Includes market-level information such as growth rate, opportunities, and competition.
            context (str): Optional qualitative context about the startup's positioning or market penetration.

        Returns:
            dict: A JSON representation of profitability insights, scalability, challenges, confidence level, and explanation.
        """
        print(f"Agent [Profitability]: Assessing profitability for startup in industry '{startup_data.get('industry')}' with market data.")

        try:
            # Construct the LLM prompt
            prompt = f"""
            You are a financial analyst specializing in startup profitability assessment. Using the startup's financial data, market data,
            and context provided below, evaluate the financial viability of the company.

            Startup Data:
            {startup_data}

            Market Data:
            {market_data}

            Context:
            {context or "No additional context provided."}

            Provide the following analysis in JSON format:
            {{
                "recurring_revenue": "<Is there a recurring revenue model? Explain its impact.>",
                "profitability_assessment": "<Is the startup financially viable? Explain in detail.>",
                "scalability": "<How scalable is the business model? Provide justification.>",
                "competitive_analysis": "<Does competition affect profitability? Summarize its impact.>",
                "confidence": "<High | Medium | Low>",
                "explanation": "Include reasoning for the entire profitability analysis, combining financial metrics and market data insights."
            }}
            """

            # Prepare messages for the LLM
            messages = [
                {"role": "system", "content": "You are a financial analyst providing detailed profitability assessments."},
                {"role": "user", "content": prompt},
            ]

            # Send the prompt to the LLM using BaseAgent's _send_llm_request
            response = self._send_llm_request(messages)

            # Validate and return the response
            if response:
                print(f"Agent [Profitability]: Successfully retrieved profitability insights: {response}")
                return response
            else:
                raise ValueError("No response from LLM.")
        except Exception as e:
            print(f"Agent [Profitability] Error: {e}")
            return {
                "recurring_revenue": None,
                "profitability_assessment": "Error: Unable to fetch profitability analysis.",
                "scalability": None,
                "competitive_analysis": "Error: Could not analyze competitive impact.",
                "confidence": "Error",
                "explanation": "No explanation available due to an error."
            }