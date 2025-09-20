# src/document_agents/document_conclusion_agent.py
import fitz  # PyMuPDF

from Agents.base_agent import BaseAgent

class DocumentConclusionAgent(BaseAgent):
    """Generates a conclusion based on the entire PDF document."""

    def _read_whole_pdf(self, pdf_path: str) -> str:
        """Extracts all text from the PDF."""
        doc = fitz.open(pdf_path)
        parts = []
        for i in range(doc.page_count):
            page = doc.load_page(i)
            t = page.get_text("text") or ""
            if t.strip():
                parts.append(t.strip())
        doc.close()
        return "\n\n".join(parts).strip()

    def conclude(self, pdf_path: str, target_words: int) -> str:
        """Generate a conclusion from the entire PDF."""
        print(f"Agent [Conclusion]: Reading full PDF '{pdf_path}'...")

        full_text = self._read_whole_pdf(pdf_path)
        if not full_text:
            print("No extractable text found in the document.")
            return ""

        system_prompt = (
            f"You are a concise summarizer. Write a clear CONCLUSION of about {target_words} words "
            "based on the following document. Summarize the purpose, main findings, and overall takeaway. "
            "Output plain text only."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_text[:120000]}  # truncate if doc is huge
        ]

        response = self._send_llm_request(messages)
        return str(response).strip() if response else ""
