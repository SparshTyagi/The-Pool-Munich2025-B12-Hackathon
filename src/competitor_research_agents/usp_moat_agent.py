from Agents.base_agent import BaseAgent

class USPMoatAgent(BaseAgent):
    """Agent to evaluate the startup's USP and competitive moat."""

    def analyze_usps(self, startup_description: str, competitors: list[str]) -> dict:
        """
        Compares the startup's Unique Selling Proposition (USP) to competitors.

        Args:
            startup_description (str): Description of the startup's product or service.
            competitors (list): List of competitor names.

        Returns:
            dict: JSON object containing USP, moat analysis, and explanation.
        """
        print(f"Agent [USPMoat]: Comparing USP for startup: {startup_description} against competitors: {competitors}")

        try:
            # Prompt construction
            prompt = f"""
            Compare the following startup's Unique Selling Proposition (USP) to its competitors. Also, evaluate its competitive moat (e.g., defensibility, barriers to replication).

            Startup Description:
            "{startup_description}"

            Competitors:
            {", ".join(competitors)}

            Provide your response as a JSON object:
            {{
                "USP": "<The identified USP of the startup>",
                "moat_analysis": "<The competitive moat and its defensibility>",
                "explanation": "How the USP and moat were determined."
            }}
            """
            messages = [
                {"role": "system", "content": "You are analyzing USP and competitive moats."},
                {"role": "user", "content": prompt}
            ]
            response = self._send_llm_request(messages)

            # Validate and return response
            if response:
                print(f"Agent [USPMoat]: Successfully retrieved USP and moat analysis: {response}")
                return response
            else:
                raise ValueError("No response from LLM.")
        except Exception as e:
            print(f"Agent [USPMoat] Error: {e}")
            return {
                "USP": None,
                "moat_analysis": None,
                "explanation": "Error occurred while retrieving USP and moat analysis."
            }