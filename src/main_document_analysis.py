# src/main_document_analysis.py
import os
import json
import sys
from dotenv import load_dotenv

# Add the 'src' directory to the Python path to find our agent packages
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the new document agents
from document_agents.pdf_extractor_agent import PdfExtractorAgent
from document_agents.multimodal_analysis_agent import MultimodalAnalysisAgent

# Import the validation orchestrator
from orchestrator_validation import ValidationOrchestrator

class DocumentAnalysisOrchestrator:
    def __init__(self):
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dotenv_path = os.path.join(project_root, '.env')
        load_dotenv(dotenv_path=dotenv_path)

        self.llm_api_key = os.getenv("API_KEY")
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        self.model = "openrouter/sonoma-sky-alpha" # Explicitly use Sonoma for its image capabilities

        if not self.llm_api_key or not self.tavily_api_key:
            raise ValueError(f"API keys not found. Check your .env file at {dotenv_path}")

        # Instantiate all necessary agents and orchestrators
        self.extractor = PdfExtractorAgent()
        self.analyzer = MultimodalAnalysisAgent(model=self.model, api_key=self.llm_api_key)
        self.validator = ValidationOrchestrator(
            llm_api_key=self.llm_api_key,
            tavily_api_key=self.tavily_api_key,
            model=self.model
        )

    def run_from_pdf(self, pdf_path: str, page_number: int):
        """
        Executes the full end-to-end workflow:
        1. Extracts a page from a PDF as an image.
        2. Analyzes the image to extract textual claims.
        3. Pipelines the extracted text to the validation workflow.
        """
        print("--- STARTING DOCUMENT ANALYSIS & VALIDATION WORKFLOW ---")
        
        # Step 1: Extract page from PDF
        image_bytes = self.extractor.extract_page_as_image(pdf_path, page_number)
        if not image_bytes:
            return {"error": "Workflow failed at PDF extraction step."}
        
        # Step 2: Analyze the image with the multimodal LLM
        analysis_prompt = "Analyze this presentation slide. Extract all the key claims, data points, and specific statements made. Present them as a clear, structured block of text suitable for fact-checking. Ignore any design elements and focus only on the information presented."
        extracted_text = self.analyzer.analyze_image(image_bytes, analysis_prompt)
        if not extracted_text:
            return {"error": "Workflow failed at multimodal analysis step."}
        
        print("\n--- Multimodal Analysis Result ---")
        print(extracted_text)
        print("--------------------------------\n")
        
        # Step 3: Pipeline the extracted text to the validation orchestrator
        print("Pipelining extracted text to the validation workflow...")
        final_report = self.validator.run(extracted_text)
        
        print("--- DOCUMENT ANALYSIS & VALIDATION WORKFLOW COMPLETED ---")
        return final_report


if __name__ == '__main__':
    # --- CONFIGURATION ---
    # Create a 'sample_data' folder in 'src' and place your PDF there.
    PDF_FILE_PATH = os.path.join("src", "sample_data", "example-presentation.pdf")
    PAGE_TO_ANALYZE = 0  # Page numbers are 0-indexed

    # --- EXECUTION ---
    orchestrator = DocumentAnalysisOrchestrator()
    final_analysis = orchestrator.run_from_pdf(PDF_FILE_PATH, PAGE_TO_ANALYZE)
    
    print("\n\n--- FINAL COMPREHENSIVE REPORT ---")
    if final_analysis:
        print(json.dumps(final_analysis, indent=2))
    else:
        print("The full analysis could not be completed.")