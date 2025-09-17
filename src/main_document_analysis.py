# src/main_document_analysis.py
import os
import json
import sys
import fitz
from dotenv import load_dotenv
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from document_agents.enhanced_pdf_extractor_agent import EnhancedPdfExtractorAgent
from document_agents.multimodal_analysis_agent import MultimodalAnalysisAgent
from document_agents.triage_agent import TriageAgent
from validation_agents.claim_classifier_agent import ClaimClassifierAgent
from validation_agents.synthesizer_agent import ContentSynthesizerAgent
from orchestrator_validation import ValidationOrchestrator
from knowledge_base import DocumentKnowledgeBase
from validation_agents.auditor_agent import AuditorAgent

class DocumentAnalysisOrchestrator:
    def __init__(self, visual_model: str, reasoning_model: str):
        load_dotenv()  # Load environment variables from .env file
        self.llm_api_key = os.getenv("API_KEY")
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")

        # Instantiate agents with dynamically assigned models
        self.extractor = EnhancedPdfExtractorAgent()
        self.analyzer = MultimodalAnalysisAgent(model=visual_model, api_key=self.llm_api_key)
        self.synthesizer = ContentSynthesizerAgent(model=reasoning_model, api_key=self.llm_api_key)
        self.triage = TriageAgent(model=reasoning_model, api_key=self.llm_api_key)
        self.classifier = ClaimClassifierAgent(model=reasoning_model, api_key=self.llm_api_key)
        self.validator = ValidationOrchestrator(
            llm_api_key=self.llm_api_key, tavily_api_key=self.tavily_api_key, model=reasoning_model
        )
        self.auditor = AuditorAgent(model=reasoning_model, api_key=self.llm_api_key)

    def _pre_analyze_for_context(self, pdf_path: str) -> str:
        """Uses the text of the entire document for rich context establishment."""
        print("--- PRE-ANALYSIS: Establishing document context from full document text ---")
        full_text = self.extractor.extract_full_text(pdf_path)
        if not full_text: return "General business presentation"
        
        prompt = "You are a business analyst. Read the text from an entire presentation and identify the primary subject (company/product). Describe it in a short, specific phrase suitable for guiding a search engine. Example: 'Startup named Butterfly focusing on European innovation'."
        # This is a text-only task, so we can use the main reasoning client
        response = self.synthesizer.client.chat.completions.create(
            model=self.synthesizer.model,
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": full_text}]
        ).choices[0].message.content
        print(f"Context established: '{response}'")
        return response

    def run_full_document_analysis(self, pdf_path: str):
        print("--- STARTING ADVANCED DOCUMENT ANALYSIS & VALIDATION WORKFLOW ---")
        num_pages = fitz.open(pdf_path).page_count
        document_context = self._pre_analyze_for_context(pdf_path)
        knowledge_base = DocumentKnowledgeBase(document_subject=document_context)
        full_report = {"document_analysis_report": []}

        for page_num in range(num_pages):
            print(f"\n--- Processing Page {page_num}/{num_pages-1} ---")
            page_report = {"page_number": page_num, "status": "Processing"}

            # Standard pipeline: Extract -> Analyze -> Synthesize -> Triage
            extracted = self.extractor.extract_content(pdf_path, page_num)
            visual_analysis = self.analyzer.analyze_image(extracted["image_bytes"], "Describe the visual layout, charts, and tone. Do NOT transcribe text.") if extracted.get("image_bytes") else ""
            content = self.synthesizer.synthesize(extracted.get("native_text", ""), visual_analysis or "")
            triage_result = self.triage.contains_verifiable_claims(content)

            if not triage_result.get("contains_verifiable_claims"):
                page_report.update({"status": "Skipped", "reason": triage_result.get("reason")})
                full_report["document_analysis_report"].append(page_report)
                continue
            
            decomposed_claims = self.validator.decomposer.decompose(content)
            classified_claims = self.classifier.classify_claims(decomposed_claims, document_context)
            
            page_report["analyzed_claims"] = []

            external_claims = classified_claims.get('external', [])
            if external_claims:
                print(f"Found {len(external_claims)} external claims to validate via web search...")
                # We combine the claims into one text blob for the validator's run method
                validation_results = self.validator.run(" ".join(external_claims), document_context)
                if validation_results and "validation_results" in validation_results:
                    page_report["analyzed_claims"].extend(validation_results["validation_results"])

            internal_claims = classified_claims.get('internal', [])
            if internal_claims:
                for claim in internal_claims:
                    knowledge_base.add_claim(claim, page_num) # Add to KB for the audit
                    page_report["analyzed_claims"].append({
                        "claim": claim,
                        "conclusion": "INTERNAL_STATEMENT_RECORDED",
                        "summary": "This is a claim made by the document about itself. It will be audited for verifiable facts in a final pass.",
                        "evidence": [{"source": f"Document Page {page_num}"}]
                    })
            
            page_report["status"] = "Analyzed"
            full_report["document_analysis_report"].append(page_report)

        # --- PASS 2: Final Audit and Re-Verification ---
        print("\n--- INITIATING FINAL AUDIT OF INTERNAL CLAIMS ---")
        claims_to_reaudit = self.auditor.audit_claims(knowledge_base.internal_claims, document_context)
        
        if claims_to_reaudit:
            print(f"Audit flagged {len(claims_to_reaudit)} claims for external verification...")
            # We combine the flagged claims into one text blob for an efficient final validation run
            final_validation_results = self.validator.run(" ".join(claims_to_reaudit), document_context)
            
            # Add a new section to the report for these crucial results
            full_report["audit_validation_report"] = final_validation_results
        else:
            print("Audit found no internal claims requiring external verification.")

        full_report["final_knowledge_base"] = knowledge_base.internal_claims
        print("\n--- FULL DOCUMENT ANALYSIS & VALIDATION WORKFLOW COMPLETED ---")
        return full_report

def save_report_to_file(report: dict, original_filename: str):
    """Saves the final report to a timestamped JSON file in a 'reports' directory."""
    # Ensure the reports directory exists in the project root
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    reports_dir = os.path.join(project_root, "reports")
    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = os.path.basename(original_filename)
    file_name = f"{os.path.splitext(base_name)[0]}_{timestamp}_report.json"
    file_path = os.path.join(reports_dir, file_name)

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        print(f"\n--- Report successfully saved to: {file_path} ---")
    except Exception as e:
        print(f"\n--- Error saving report to file: {e} ---")


if __name__ == '__main__':
    PDF_FILE_PATH = os.path.join("src", "sample_data", "example-presentation.pdf")
    
    VISUAL_HEAVY_MODEL = "moonshotai/kimi-vl-a3b-thinking:free"
    FAST_REASONING_MODEL = "openrouter/sonoma-sky-alpha"

    orchestrator = DocumentAnalysisOrchestrator(
        visual_model=VISUAL_HEAVY_MODEL,
        reasoning_model=FAST_REASONING_MODEL
    )
    final_analysis = orchestrator.run_full_document_analysis(PDF_FILE_PATH)
    
    print("\n\n--- FINAL COMPREHENSIVE REPORT ---")
    if final_analysis:
        print(json.dumps(final_analysis, indent=2))
        save_report_to_file(final_analysis, PDF_FILE_PATH)