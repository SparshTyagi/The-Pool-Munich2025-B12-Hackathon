# src/document_agents/enhanced_pdf_extractor_agent.py
import fitz  # PyMuPDF

class EnhancedPdfExtractorAgent:
    """
    An agent that extracts content from a PDF in two ways:
    1. As highly accurate native text.
    2. As a rendered image for visual analysis.
    """
    def extract_content(self, pdf_path: str, page_number: int) -> dict:
        """
        Opens a PDF and extracts both native text and an image of the page.
        """
        print(f"Agent [Extractor]: Performing hybrid extraction on page {page_number}...")
        try:
            doc = fitz.open(pdf_path)
            if page_number < 0 or page_number >= doc.page_count:
                print(f"Error: Page number {page_number} is out of bounds.")
                return {}
            
            page = doc.load_page(page_number)
            
            # Pass 1: Extract native text - highly accurate for text data
            native_text = page.get_text("text")
            
            # Pass 2: Render page as an image - for visual context
            pix = page.get_pixmap(dpi=200) # Increased DPI for better image quality
            img_bytes = pix.tobytes("png")
            
            doc.close()
            print("Agent [Extractor]: Hybrid extraction complete.")
            return {"native_text": native_text, "image_bytes": img_bytes}
        except Exception as e:
            print(f"An error occurred during PDF extraction: {e}")
            return {}
        
    def extract_full_text(self, pdf_path: str) -> str:
        """Extracts native text from every page of the document."""
        print("Agent [Extractor]: Performing full-text extraction for global context...")
        full_text = ""
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                full_text += f"\n--- Page {page_num} ---\n{page.get_text('text')}"
            doc.close()
            return full_text
        except Exception as e:
            print(f"An error occurred during full-text extraction: {e}")
            return ""