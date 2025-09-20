# src/orchestrator_competitor_research.py
from competitor_research_agents.competitor_rank_agent import CompetitorRankAgent
from competitor_research_agents.usp_moat_agent import USPMoatAgent
from competitor_research_agents.similar_company_finder_agent import SimilarCompanyFinderAgent
from competitor_research_agents.historical_analysis_agent import HistoricalAnalysisAgent

class CompetitorResearchOrchestrator:
    """Orchestrator to coordinate competitor research using multiple agents."""

    def __init__(self, llm_api_key: str, tavily_api_key: str, model: str):
        self.similar_company_finder = SimilarCompanyFinderAgent(model, llm_api_key)
        self.usp_moat_agent = USPMoatAgent(model=model, api_key=llm_api_key)
        self.competitor_rank_agent = CompetitorRankAgent(model=model, api_key=llm_api_key)
        self.historical_analysis_agent = HistoricalAnalysisAgent(model=model, api_key=llm_api_key)

    def run(self, startup_description: str, competitors: list[str], years: int) -> dict:
        """
        Orchestrates the competitor research process.

        Args:
            startup_description (str): Description of the startup.
            competitors (list[str]): List of competitor names.
            years (int): Time range for historical analysis.

        Returns:
            dict: Consolidated research report.
        """
        try:
            # Step 1: Find similar companies
            similar_companies = self.similar_company_finder.find_similar_companies(startup_description)
            print(f"Similar companies found: {similar_companies}")

            # Step 2: Analyze USP and moat
            usp_moat_analysis = self.usp_moat_agent.analyze_usps(startup_description, similar_companies)
            print(f"USP and moat analysis: {usp_moat_analysis}")

            # Step 3: Rank competitors
            competitor_details = [{"name": comp, "strengths": [], "weaknesses": []} for comp in similar_companies]
            ranked_competitors = self.competitor_rank_agent.rank_competitors(competitor_details)
            print(f"Ranked competitors: {ranked_competitors}")

            # Step 4: Historical analysis
            historical_analysis = self.historical_analysis_agent.find_historical_similar_companies(similar_companies, years)
            print(f"Historical analysis: {historical_analysis}")

            # Step 5: Aggregate results
            final_report = {
                "similar_companies": similar_companies,
                "usp_moat_analysis": usp_moat_analysis,
                "ranked_competitors": ranked_competitors,
                "historical_analysis": historical_analysis,
            }
            return final_report

        except Exception as e:
            print(f"Error in orchestrating competitor research: {e}")
            return {"error": str(e)}
