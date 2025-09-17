# src/main_document_analysis.py
import os
import json
import sys
import fitz # PyMuPDF
import datetime
from dotenv import load_dotenv

# Add the 'src' directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import all necessary agents and the sub-orchestrator
from document_agents.pdf_extractor_agent import PdfExtractorAgent
from document_agents.multimodal_analysis_agent import MultimodalAnalysisAgent
from document_agents.triage_agent import TriageAgent # NEW
from orchestrator_validation import ValidationOrchestrator

class DocumentAnalysisOrchestrator:
    def __init__(self):
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dotenv_path = os.path.join(project_root, '.env')
        load_dotenv(dotenv_path=dotenv_path)

        self.llm_api_key = os.getenv("API_KEY")
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        self.model = "openrouter/sonoma-sky-alpha"

        if not self.llm_api_key or not self.tavily_api_key:
            raise ValueError(f"API keys not found. Check your .env file at {dotenv_path}")

        # Instantiate all agents
        self.extractor = PdfExtractorAgent()
        self.analyzer = MultimodalAnalysisAgent(model=self.model, api_key=self.llm_api_key)
        self.triage = TriageAgent(model=self.model, api_key=self.llm_api_key) # NEW
        self.validator = ValidationOrchestrator(
            llm_api_key=self.llm_api_key, tavily_api_key=self.tavily_api_key, model=self.model
        )

    def _pre_analyze_for_context(self, pdf_path: str) -> str | None:
        """Analyzes the first page to establish the document's primary subject."""
        print("--- PRE-ANALYSIS: Establishing document context from title page ---")
        image_bytes = self.extractor.extract_page_as_image(pdf_path, 0)
        if not image_bytes:
            return None
        
        prompt = "Analyze this title slide. Identify the primary subject, company, or product name. Describe it in a short phrase suitable for guiding a search engine. For example: 'Startup named Butterfly focusing on European innovation'. If you can't identify a clear subject, say 'General business presentation'."
        context = self.analyzer.analyze_image(image_bytes, prompt)
        print(f"Context established: '{context}'")
        return context

    def run_full_document_analysis(self, pdf_path: str):
        """
        Executes the full end-to-end workflow for an entire PDF document.
        """
        print("--- STARTING FULL DOCUMENT ANALYSIS & VALIDATION WORKFLOW ---")
        
        try:
            doc = fitz.open(pdf_path)
            num_pages = doc.page_count
            doc.close()
        except Exception as e:
            return {"error": f"Failed to open or read PDF: {e}"}

        document_context = self._pre_analyze_for_context(pdf_path)
        full_report = {"document_analysis_report": []}

        # Loop through every page of the document
        for page_num in range(num_pages):
            print(f"\n--- Processing Page {page_num}/{num_pages-1} ---")
            page_report = {"page_number": page_num}

            image_bytes = self.extractor.extract_page_as_image(pdf_path, page_num)
            if not image_bytes:
                page_report.update({"status": "Failed", "reason": "Could not extract page as image."})
                full_report["document_analysis_report"].append(page_report)
                continue
            
            # Use multimodal analysis to get the text content first
            text_content = self.analyzer.analyze_image(image_bytes, "Transcribe all text on this slide.")
            if not text_content:
                page_report.update({"status": "Skipped", "reason": "No text content could be extracted from the image."})
                full_report["document_analysis_report"].append(page_report)
                continue

            # Step 1: Triage the extracted text to see if it's worth validating
            triage_result = self.triage.contains_verifiable_claims(text_content)
            if not triage_result.get("contains_verifiable_claims"):
                page_report.update({"status": "Skipped", "reason": triage_result.get("reason")})
                full_report["document_analysis_report"].append(page_report)
                continue

            # Step 2: If triage passes, pipeline to the full validation workflow
            page_report["status"] = "Analyzed"
            validation_results = self.validator.run(text_content, document_context)
            page_report["validation_results"] = validation_results
            full_report["document_analysis_report"].append(page_report)

        print("\n--- FULL DOCUMENT ANALYSIS & VALIDATION WORKFLOW COMPLETED ---")
        return full_report

def save_report_to_file(report: dict, original_filename: str):
    """Saves the final report to a timestamped JSON file."""
    if not os.path.exists("reports"):
        os.makedirs("reports")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = os.path.basename(original_filename)
    file_name = f"{os.path.splitext(base_name)[0]}_{timestamp}_report.json"
    file_path = os.path.join("reports", file_name)

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        print(f"\n--- Report successfully saved to: {file_path} ---")
    except Exception as e:
        print(f"\n--- Error saving report to file: {e} ---")


if __name__ == '__main__':
    PDF_FILE_PATH = os.path.join("src", "sample_data", "example-presentation.pdf")
    PAGE_TO_ANALYZE = 0 

    orchestrator = DocumentAnalysisOrchestrator()
    final_analysis = orchestrator.run_full_document_analysis(PDF_FILE_PATH)
    
    print("\n\n--- FINAL COMPREHENSIVE REPORT ---")
    if final_analysis:
        print(json.dumps(final_analysis, indent=2))
        save_report_to_file(final_analysis, PDF_FILE_PATH)
    else:
        print("The full analysis could not be completed.")