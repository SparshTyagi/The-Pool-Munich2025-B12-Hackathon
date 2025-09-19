import os
import json
import sys
import fitz
import logging
from datetime import datetime
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from document_agents.pdf_extractor_agent import PdfExtractorAgent
from document_agents.multimodal_analysis_agent import MultimodalAnalysisAgent
from document_agents.triage_agent import TriageAgent
from orchestrator_validation import ValidationOrchestrator
from orchestrator_market_insight import MarketInsightOrchestrator
from orchestrator_competitor_research import CompetitorResearchOrchestrator

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class DocumentAnalysisOrchestrator:
    def __init__(self):
        load_dotenv()
        self.llm_api_key = os.getenv("API_KEY")
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        self.model = "openrouter/sonoma-sky-alpha"

        if not self.llm_api_key or not self.tavily_api_key:
            raise ValueError("API keys not found. Check your .env file.")

        # Initialize agents and orchestrators
        self.extractor = PdfExtractorAgent()
        self.analyzer = MultimodalAnalysisAgent(model=self.model, api_key=self.llm_api_key)
        self.triage = TriageAgent(model=self.model, api_key=self.llm_api_key)

        # Initialize orchestrators
        self.validator = ValidationOrchestrator(
            llm_api_key=self.llm_api_key,
            tavily_api_key=self.tavily_api_key,
            model=self.model
        )
        self.market_insight_orchestrator = MarketInsightOrchestrator(
            llm_api_key=self.llm_api_key,
            tavily_api_key=self.tavily_api_key,
            model=self.model
        )
        self.competitor_research_orchestrator = CompetitorResearchOrchestrator(
            llm_api_key=self.llm_api_key,
            tavily_api_key=self.tavily_api_key,
            model=self.model
        )

    def _extract_startup_description(self, pdf_path: str) -> str:
        """Extract startup description from document."""
        try:
            doc = fitz.open(pdf_path)
            description_parts = []

            for page_num in range(min(3, doc.page_count)):
                text = self.extractor.extract_page_text(pdf_path, page_num)
                if text:
                    description_parts.append(text[:300])

            doc.close()
            return " ".join(description_parts) if description_parts else "Technology startup"
        except Exception as e:
            logging.error(f"Error extracting startup description: {e}")
            return "Technology startup"

    def _run_market_insights(self, startup_description: str) -> dict:
        """Generate market insights using MarketInsightOrchestrator."""
        logging.info("Generating Market Insights")
        try:
            result = self.market_insight_orchestrator.run(
                description=startup_description,
                region="Global",
                timeframe=5
            )
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "success",
                "data": result
            }
        except Exception as e:
            logging.error(f"Market insight generation failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "error",
                "error": str(e)
            }

    def _run_competitor_research(self, startup_description: str, competitors: list) -> dict:
        """Generate competitor research analysis."""
        logging.info("Generating Competitor Research")
        try:
            result = self.competitor_research_orchestrator.run(
                startup_description=startup_description,
                competitors=competitors,
                years=3
            )
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "success",
                "data": result
            }
        except Exception as e:
            logging.error(f"Competitor research failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "error",
                "error": str(e)
            }

    def _pre_analyze_for_context(self, pdf_path: str) -> str:
        """Analyze first page for document context."""
        logging.info("Establishing document context")
        image_bytes = self.extractor.extract_page_as_image(pdf_path, 0)
        if not image_bytes:
            return "General business document"

        context = self.analyzer.analyze_slide_content(image_bytes, None)
        return context or "General business document"

    def _process_page(self, pdf_path: str, page_num: int, document_context: str) -> dict:
        """Process individual page for validation."""
        page_report = {"page_number": page_num + 1}

        try:
            raw_text = self.extractor.extract_page_text(pdf_path, page_num)
            image_bytes = self.extractor.extract_page_as_image(pdf_path, page_num)

            if not image_bytes:
                page_report.update({"status": "Failed", "reason": "Image extraction failed"})
                return page_report

            synthesized_content = self.analyzer.analyze_slide_content(image_bytes, raw_text)
            if not synthesized_content:
                page_report.update({"status": "Skipped", "reason": "No content synthesized"})
                return page_report

            triage_result = self.triage.contains_verifiable_claims(synthesized_content)
            if not triage_result.get("contains_verifiable_claims"):
                page_report.update({"status": "Skipped", "reason": triage_result.get("reason")})
                return page_report

            validation_results = self.validator.run(synthesized_content, document_context)
            page_report.update({
                "status": "Analyzed",
                "validation_results": validation_results
            })

        except Exception as e:
            logging.error(f"Error processing page {page_num + 1}: {e}")
            page_report.update({"status": "Error", "error": str(e)})

        return page_report

    def run_full_document_analysis(self, pdf_path: str, competitors: list = None):
        """Execute comprehensive analysis workflow."""
        logging.info("Starting full document analysis workflow")

        try:
            doc = fitz.open(pdf_path)
            num_pages = doc.page_count
            doc.close()
        except Exception as e:
            return {"error": f"Failed to open PDF: {e}"}

        # Extract startup description and context
        startup_description = self._extract_startup_description(pdf_path)
        document_context = self._pre_analyze_for_context(pdf_path)

        # Initialize comprehensive report
        full_report = {
            "market_insights": self._run_market_insights(startup_description),
            "competitor_research": None,
            "document_validation": []
        }

        # Add competitor research if competitors provided
        if competitors:
            full_report["competitor_research"] = self._run_competitor_research(
                startup_description, competitors
            )

        # Process document pages
        for page_num in range(num_pages):
            logging.info(f"Processing page {page_num + 1}/{num_pages}")
            page_report = self._process_page(pdf_path, page_num, document_context)
            full_report["document_validation"].append(page_report)

        logging.info("Full document analysis completed")
        return full_report


def save_report_to_file(report: dict, original_filename: str):
    """Save report to timestamped JSON file."""
    if not os.path.exists("reports"):
        os.makedirs("reports")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = os.path.basename(original_filename)
    file_name = f"{os.path.splitext(base_name)[0]}_{timestamp}_report.json"
    file_path = os.path.join("reports", file_name)

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=4)
        logging.info(f"Report saved to: {file_path}")
    except Exception as e:
        logging.error(f"Error saving report: {e}")


def main():
    """Main execution function."""
    PDF_FILE_PATH = os.path.join("src", "sample_data", "example-presentation.pdf")

    try:
        orchestrator = DocumentAnalysisOrchestrator()

        # Example with competitors
        competitors = ["Microsoft", "Google", "Amazon"]  # Add actual competitors
        final_analysis = orchestrator.run_full_document_analysis(
            PDF_FILE_PATH,
            competitors=competitors
        )

        logging.info("Analysis completed")
        if final_analysis:
            print(json.dumps(final_analysis, indent=2))
            save_report_to_file(final_analysis, PDF_FILE_PATH)
        else:
            logging.error("Analysis could not be completed")

    except Exception as e:
        logging.error(f"Error in main execution: {e}")


if __name__ == '__main__':
    main()
