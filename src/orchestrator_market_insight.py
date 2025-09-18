# src/orchestrator_market_insight.py
import os
import sys

# Ensure the market_insight_agents package can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from market_insight_agents.document_conclusion_agent import DocumentConclusionAgent
from Agents.search_agent import SearchAgent

class MarketInsightOrchestrator:
    """Manages the workflow for generating market insights based on PDF documents."""

    def __init__(self, llm_api_key: str, tavily_api_key: str, model: str):
        self.document_conclusion_agent = DocumentConclusionAgent(model=model, api_key=llm_api_key)
        self.searcher = SearchAgent(api_key=tavily_api_key)

    def run(self, pdf_path: str, target_words: int) -> dict:
        """
        Executes the document analysis to generate a market insight conclusion.

        Args:
            pdf_path (str): Path to the PDF file to analyze.
            target_words (int): Approximate word length for the conclusion.

        Returns:
            dict: A dictionary containing the generated conclusion or an error message.
        """
        print("\n--- STARTING MARKET INSIGHT GENERATION WORKFLOW ---")

        try:
            # Step 1: Generate a conclusion for the entire document
            conclusion = self.document_conclusion_agent.conclude(pdf_path=pdf_path, target_words=target_words)

            if not conclusion:
                return {"error": "Market insight generation failed: No conclusion could be generated from the document."}

            print("--- MARKET INSIGHT WORKFLOW COMPLETED SUCCESSFULLY ---")
            return {"conclusion": conclusion}

        except Exception as e:
            print(f"Error occurred during market insight generation: {e}")
            return {"error": f"An exception occurred: {e}"}