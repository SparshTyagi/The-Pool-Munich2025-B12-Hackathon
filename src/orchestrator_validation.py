# src/orchestrator_validation.py
import os
import json
import sys
from dotenv import load_dotenv

# Ensure the validation_agents package can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from validation_agents.decomposer_agent import DecomposerAgent
from validation_agents.planner_agent import PlannerAgent
from validation_agents.search_agent import SearchAgent
from validation_agents.reputability_agent import ReputabilityAgent
from validation_agents.validation_agent import ValidationAgent

class ValidationOrchestrator: # RENAMED CLASS
    """Manages the entire multi-agent claim validation workflow."""
    def __init__(self, llm_api_key: str, tavily_api_key: str, model: str):
        # Agents are now initialized with passed-in keys
        self.decomposer = DecomposerAgent(model=model, api_key=llm_api_key)
        self.planner = PlannerAgent(model=model, api_key=llm_api_key)
        self.searcher = SearchAgent(api_key=tavily_api_key)
        self.reputability_checker = ReputabilityAgent(model=model, api_key=llm_api_key)
        self.validator = ValidationAgent(model=model, api_key=llm_api_key)


    def run(self, text: str, document_context: str | None = None) -> dict: # MODIFIED signature
        """
        Executes the full, multi-agent validation workflow from start to finish.
        """
        print("\n--- STARTING CLAIM VALIDATION SUB-WORKFLOW ---")
        
        claims = self.decomposer.decompose(text)
        if not claims: return {"error": "Validation failed: Could not decompose text into claims."}
        print(f"Successfully decomposed into {len(claims)} claims.")

        # MODIFIED: Pass the document context to the planner
        queries = self.planner.plan(claims, document_context=document_context)
        if not queries: return {"error": "Validation failed: Could not create a search plan."}
        print(f"Optimized plan created with {len(queries)} context-aware queries.")

        context, sources = self.searcher.search(queries)
        if not context: return {"error": "Validation failed: Failed to retrieve any content."}
        print(f"Retrieved content from {len(sources)} unique sources.")
        
        evaluated_sources = self.reputability_checker.evaluate(sources)
        final_report = self.validator.validate(claims, context, evaluated_sources)
        
        print("--- CLAIM VALIDATION SUB-WORKFLOW COMPLETED ---\n")
        return final_report

# The if __name__ == '__main__' block is removed. This is now a library file.