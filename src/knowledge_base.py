# src/knowledge_base.py
class DocumentKnowledgeBase:
    """A simple stateful object to store claims made within a document."""
    def __init__(self, document_subject: str):
        self.subject = document_subject
        self.internal_claims = []

    def add_claim(self, claim_text: str, page_number: int):
        """Adds a new internal claim to the knowledge base."""
        self.internal_claims.append({"claim": claim_text, "page": page_number})

    def get_all_claims_as_text(self) -> str:
        """Returns all stored claims as a formatted string."""
        if not self.internal_claims:
            return "No internal claims have been recorded yet."
        return "\n".join(f"- (Page {c['page']}) {c['claim']}" for c in self.internal_claims)