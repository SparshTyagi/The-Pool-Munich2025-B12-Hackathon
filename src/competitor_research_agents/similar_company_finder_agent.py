# src/competitor_research_agents/similar_company_finder_agent.py

class SimilarCompanyFinderAgent:
    """Agent to find similar companies based on input text."""

    def __init__(self, model: str, api_key: str):
        """
        Initialize the agent with the required LLM model and API Key.

        Args:
            model (str): The LLM model to use.
            api_key (str): API key for the LLM provider.
        """
        self.model = model
        self.api_key = api_key

    def find_similar_companies(self, text: str) -> list[str]:
        """
        Identifies similar companies based on the given input text.

        Args:
            text (str): The input text describing a company, industry, or context.

        Returns:
            list[str]: A list of similar companies (names), or an empty list if no matches are found.
        """
        print(f"[SimilarCompanyFinderAgent] Finding similar companies for input text: {text}")

        # Placeholder logic for utilizing LLM or search
        # Replace this with actual API call logic for your model
        try:
            response = self._mock_response(text)  # Simulated response for demonstration
            similar_companies = response.get("similar_companies", [])
            print(f"[SimilarCompanyFinderAgent] Found companies: {similar_companies}")
            return similar_companies
        except Exception as e:
            print(f"[SimilarCompanyFinderAgent] Error occurred: {e}")
            return []

    def _mock_response(self, text: str) -> dict:
        """
        Mock response simulating the LLM model's similar company search.

        Args:
            text (str): The input text describing a company, industry, or context.

        Returns:
            dict: A mocked response containing a list of similar companies.
        """
        # Simulated logic based on keywords in the text
        mock_companies_data = {
            "fintech": ["Stripe", "PayPal", "Square"],
            "e-commerce": ["Amazon", "Shopify", "eBay"],
            "software": ["Microsoft", "Google", "Oracle"],
        }

        for keyword, companies in mock_companies_data.items():
            if keyword in text.lower():
                return {"similar_companies": companies}

        print("[SimilarCompanyFinderAgent] No matches found in mock data.")
        return {"similar_companies": []}