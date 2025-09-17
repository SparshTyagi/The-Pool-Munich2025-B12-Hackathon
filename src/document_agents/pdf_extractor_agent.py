# src/document_agents/pdf_extractor_agent.py
import fitz  # PyMuPDF

class PdfExtractorAgent:
    """An agent that extracts a specific page from a PDF as an image."""
    def extract_page_as_image(self, pdf_path: str, page_number: int) -> bytes | None:
        """
        Opens a PDF, renders a specific page as a PNG image, and returns its bytes.
        """
        print(f"Agent [Extractor]: Extracting page {page_number} from '{pdf_path}'...")
        try:
            doc = fitz.open(pdf_path)
            if page_number < 0 or page_number >= doc.page_count:
                print(f"Error: Page number {page_number} is out of bounds for this document (0-{doc.page_count - 1}).")
                return None
            
            page = doc.load_page(page_number)
            # Render page to a pixmap (an image object)
            pix = page.get_pixmap(dpi=150)  # Higher DPI for better quality
            doc.close()
            
            # Convert the pixmap to PNG bytes
            img_bytes = pix.tobytes("png")
            print("Agent [Extractor]: Page extracted successfully as an image.")
            return img_bytes
        except Exception as e:
            print(f"An error occurred during PDF extraction: {e}")
            return None