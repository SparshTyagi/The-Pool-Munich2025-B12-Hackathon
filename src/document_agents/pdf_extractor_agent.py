# src/document_agents/pdf_extractor_agent.py
import fitz  # PyMuPDF

class PdfExtractorAgent:
    """An agent that extracts content from a PDF page in multiple formats."""

    def extract_page_as_image(self, pdf_path: str, page_number: int) -> bytes | None:
        """
        Opens a PDF, renders a specific page as a PNG image, and returns its bytes.
        """
        # The page_number is 0-indexed, so we add 1 for user-facing logs.
        print(f"Agent [Extractor-Image]: Extracting page {page_number + 1} as image...")
        try:
            doc = fitz.open(pdf_path)
            if page_number < 0 or page_number >= doc.page_count:
                print(f"Error: Page number {page_number + 1} is out of bounds for this document (1-{doc.page_count}).")
                doc.close()
                return None
            
            page = doc.load_page(page_number)
            pix = page.get_pixmap(dpi=150)  # Higher DPI for better quality
            doc.close()
            
            img_bytes = pix.tobytes("png")
            print("Agent [Extractor-Image]: Page extracted successfully as an image.")
            return img_bytes
        except Exception as e:
            print(f"An error occurred during PDF image extraction: {e}")
            return None

    def extract_page_text(self, pdf_path: str, page_number: int) -> str | None:
        """
        Extracts all raw text content from a specific PDF page.
        """
        # The page_number is 0-indexed, so we add 1 for user-facing logs.
        print(f"Agent [Extractor-Text]: Extracting text from page {page_number + 1}...")
        try:
            doc = fitz.open(pdf_path)
            if page_number < 0 or page_number >= doc.page_count:
                print(f"Error: Page number {page_number + 1} is out of bounds for this document (1-{doc.page_count}).")
                doc.close()
                return None
            
            page = doc.load_page(page_number)
            text = page.get_text("text")
            doc.close()
            
            if text:
                print("Agent [Extractor-Text]: Text extracted successfully.")
                return text.strip()
            else:
                print("Agent [Extractor-Text]: No native text found on this page.")
                return None
        except Exception as e:
            print(f"An error occurred during PDF text extraction: {e}")
            return None