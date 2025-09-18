# src/orchestrator_validation.py
import os
import sys

# Ensure the validation_agents package can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from validation_agents.decomposer_agent import DecomposerAgent
from validation_agents.planner_agent import PlannerAgent
from Agents.search_agent import SearchAgent
from validation_agents.reputability_agent import ReputabilityAgent
from validation_agents.validation_agent import ValidationAgent

class ValidationOrchestrator:
    """Manages the entire multi-agent claim validation workflow."""
    def __init__(self, llm_api_key: str, tavily_api_key: str, model: str):
        self.decomposer = DecomposerAgent(model=model, api_key=llm_api_key)
        self.planner = PlannerAgent(model=model, api_key=llm_api_key)
        self.searcher = SearchAgent(api_key=tavily_api_key)
        self.reputability_checker = ReputabilityAgent(model=model, api_key=llm_api_key)
        self.validator = ValidationAgent(model=model, api_key=llm_api_key)

    def run(self, text: str, document_context: str | None = None) -> dict:
        """
        Executes the full, multi-agent validation workflow from start to finish.
        This now validates claims one by one for improved reliability.
        """
        print("\n--- STARTING CLAIM VALIDATION SUB-WORKFLOW ---")
        
        # Step 1: Decompose text into a list of claims
        claims = self.decomposer.decompose(text)
        if not claims: 
            return {"error": "Validation failed: Could not decompose text into claims."}
        
        # Step 2: Create a search plan and retrieve all context needed for ALL claims
        queries = self.planner.plan(claims, document_context=document_context)
        if not queries: 
            return {"error": "Validation failed: Could not create a search plan."}
        
        context, sources = self.searcher.search(queries)
        if not context: 
            return {"error": "Validation failed: Failed to retrieve any content."}
        
        # Step 3: Evaluate source reputability once for all sources
        evaluated_sources = self.reputability_checker.evaluate(sources)
        
        # --- NEW PATHWAY: Loop and validate each claim individually ---
        print("\n--- Starting Individual Claim Validation Loop ---")
        final_validation_list = []
        for i, claim in enumerate(claims):
            print(f"\n>>> Validating Claim {i+1}/{len(claims)}: '{claim}'")
            # The validator agent is now called inside the loop for each claim
            single_claim_report = self.validator.validate(claim, context, evaluated_sources)
            if single_claim_report:
                final_validation_list.append(single_claim_report)
            else:
                # Append a failure record if the agent returns nothing
                final_validation_list.append({
                    "claim": claim,
                    "conclusion": "VALIDATION_ERROR",
                    "summary": "The validation agent failed to produce a result for this claim.",
                    "evidence": []
                })
        print("--- Individual Claim Validation Loop COMPLETED ---\n")

        final_report = {"validation_results": final_validation_list}
        
        print("--- CLAIM VALIDATION SUB-WORKFLOW COMPLETED ---\n")
        return final_report