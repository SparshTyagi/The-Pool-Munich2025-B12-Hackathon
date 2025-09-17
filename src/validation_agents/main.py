# src/main.py
import os
import json
import sys
from dotenv import load_dotenv

# Now these imports will work correctly
from decomposer_agent import DecomposerAgent
from planner_agent import PlannerAgent
from search_agent import SearchAgent
from reputability_agent import ReputabilityAgent
from validation_agent import ValidationAgent

class OrchestratorAgent:
    """Manages the entire multi-agent validation workflow."""
    def __init__(self):
        # Find the .env file in the project root, which is one level above 'src'
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        load_dotenv()

        llm_api_key = os.getenv("API_KEY")
        tavily_api_key = os.getenv("TAVILY_API_KEY")
        model = "openrouter/sonoma-sky-alpha"

        if not llm_api_key or not tavily_api_key:
            raise ValueError(f"API keys not found. Check your .env file")

        # Instantiate all specialized agents
        self.decomposer = DecomposerAgent(model=model, api_key=llm_api_key)
        self.planner = PlannerAgent(model=model, api_key=llm_api_key)
        self.searcher = SearchAgent(api_key=tavily_api_key)
        self.reputability_checker = ReputabilityAgent(model=model, api_key=llm_api_key)
        self.validator = ValidationAgent(model=model, api_key=llm_api_key)

    def run(self, text: str) -> dict:
        """
        Executes the full, multi-agent validation workflow from start to finish.
        """
        print("--- STARTING MULTI-AGENT VALIDATION WORKFLOW ---")
        
        claims = self.decomposer.decompose(text)
        if not claims: return {"error": "Could not decompose text into claims."}
        print(f"Successfully decomposed into {len(claims)} claims.")

        queries = self.planner.plan(claims)
        if not queries: return {"error": "Could not create a search plan."}
        print(f"Optimized plan created with {len(queries)} queries.")

        context, sources = self.searcher.search(queries)
        if not context: return {"error": "Failed to retrieve any content from sources."}
        print(f"Retrieved content from {len(sources)} unique sources.")
        
        evaluated_sources = self.reputability_checker.evaluate(sources)
        final_report = self.validator.validate(claims, context, evaluated_sources)
        
        print("--- WORKFLOW COMPLETED ---")
        return final_report

if __name__ == '__main__':
    orchestrator = OrchestratorAgent()
    
    complex_text = """
    People are saying that OpenAI's annualized revenue reportedly crossed $3.4 billion in mid-2024,
    which is an incredible number. I also heard that in 2026 it will be the biggest tech company
    in the world, bigger than Apple and Microsoft. And its main competitor isn't Google, it's Anthropic.
    """
    
    final_analysis = orchestrator.run(complex_text)

    print("\n--- FINAL COMPREHENSIVE REPORT ---")
    if final_analysis:
        print(json.dumps(final_analysis, indent=2))
    else:
        print("The analysis could not be completed.")