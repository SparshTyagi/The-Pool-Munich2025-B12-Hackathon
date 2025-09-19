# src/orchestrator_market_insight.py
import os
import sys

# Ensure the market_insight_agents package can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from market_insight_agents.market_segment_agent import MarketSegmentAgent
from market_insight_agents.market_size_agent import MarketSizeAgent
from market_insight_agents.market_outlook_agent import MarketOutlookAgent
from market_insight_agents.profitability_agent import ProfitabilityAgent

class MarketInsightOrchestrator:
    """Manages the workflow for generating market insights based on a startup description or related inputs."""

    def __init__(self, llm_api_key: str, tavily_api_key: str, model: str):
        self.segment_agent = MarketSegmentAgent(model=model, api_key=llm_api_key)
        self.size_agent = MarketSizeAgent(model=model, api_key=llm_api_key)
        self.outlook_agent = MarketOutlookAgent(model=model, api_key=llm_api_key)
        self.profitability_agent = ProfitabilityAgent(model=model, api_key=llm_api_key)

    def run(self, description: str, region: str = "Global", timeframe: int = 5) -> dict:
        """
        Executes the market insight workflow to generate comprehensive insights.

        Args:
            description (str): Startup or document-based description (e.g., focus, product, or service).
            region (str): The geographical focus of the market insights (default: "Global").
            timeframe (int): Timeframe for growth projections (default: 5 years).

        Returns:
            dict: Comprehensive market insight report, combining all agents' results.
        """
        print("\n--- STARTING MARKET INSIGHT WORKFLOW ---")

        # Initialize the report structure
        insights_report = {
            "segment_analysis": None,
            "market_size": None,
            "market_outlook": None,
            "profitability": None
        }

        try:
            # Step 1: Identify Market Segment
            print("\n--- Step 1: Identifying Market Segment ---")
            segment_data = self.segment_agent.identify_segment(description=description)
            if not segment_data or not segment_data.get("segment"):
                raise ValueError("Market segment identification failed.")

            insights_report["segment_analysis"] = segment_data

            # Step 2: Determine Market Size
            print("\n--- Step 2: Calculating Market Size ---")
            size_data = self.size_agent.get_market_size(segment=segment_data["segment"], region=region)
            if not size_data or not size_data.get("TAM"):
                raise ValueError("Market size analysis failed.")
            
            insights_report["market_size"] = size_data

            # Step 3: Assess Market Outlook
            print("\n--- Step 3: Assessing Market Outlook ---")
            outlook_data = self.outlook_agent.get_market_outlook(segment=segment_data["segment"], region=region, timeframe=timeframe)
            if not outlook_data or not outlook_data.get("growth_rate"):
                raise ValueError("Market outlook analysis failed.")

            insights_report["market_outlook"] = outlook_data

            # Step 4: Profitability Assessment
            print("\n--- Step 4: Assessing Profitability ---")
            profitability_data = self.profitability_agent.get_profitability(
                startup_data={
                    "industry": segment_data["segment"],
                    "revenue_model": "Subscription-based",
                    "recurring_revenue": True,
                    "profitability_metrics": {"gross_margin": "50%", "net_profit_margin": "20%"},
                    "scalability": "High"
                },
                market_data={
                    "growth_rate": outlook_data["growth_rate"],
                    "opportunities": outlook_data["opportunities"],
                    "competitive_pressure": "High"
                },
                context=f"Startup focusing on {description} in {region}"
            )
            if not profitability_data or not profitability_data.get("profitability_assessment"):
                raise ValueError("Profitability analysis failed.")

            insights_report["profitability"] = profitability_data

            print("\n--- MARKET INSIGHT WORKFLOW COMPLETED SUCCESSFULLY ---")

        except Exception as e:
            print(f"Error occurred during market insight generation: {e}")
            # Capture error in the final report
            insights_report["error"] = str(e)

        return insights_report