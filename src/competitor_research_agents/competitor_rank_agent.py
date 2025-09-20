from Agents.base_agent import BaseAgent

class CompetitorRankAgent(BaseAgent):
    """Agent to rank competitors based on their strengths and weaknesses."""

    def rank_competitors(self, competitors: list[dict]) -> dict:
        """
        Ranks competitors based on their strengths and weaknesses.

        Args:
            competitors (list): A list of dictionaries, each containing competitor details like name, strengths, and weaknesses.

        Returns:
            dict: A JSON object containing the ranked competitors and an explanation of the ranking process.
        """
        print(f"Agent [CompetitorRank]: Ranking competitors: {competitors}")

        try:
            # Prompt construction
            prompt = f"""
            Rank the following competitors based on their strengths and weaknesses. Consider factors like market share, innovation, customer satisfaction, and scalability.

            Competitors:
            {competitors}

            Provide your response as a JSON object:
            {{
                "ranked_competitors": [
                    {{
                        "rank": <rank>,
                        "name": "<competitor name>",
                        "strengths": ["<list of strengths>"],
                        "weaknesses": ["<list of weaknesses>"]
                    }}
                ],
                "explanation": "Explain how the ranking was determined."
            }}
            """
            messages = [
                {"role": "system", "content": "You are ranking competitors based on their strengths and weaknesses."},
                {"role": "user", "content": prompt}
            ]
            response = self._send_llm_request(messages)

            # Validate and return response
            if response:
                print(f"Agent [CompetitorRank]: Successfully ranked competitors: {response}")
                return response
            else:
                raise ValueError("No response from LLM.")
        except Exception as e:
            print(f"Agent [CompetitorRank] Error: {e}")
            return {
                "ranked_competitors": [],
                "explanation": "An error occurred while ranking competitors."
            }
