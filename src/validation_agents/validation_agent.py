# src/validation_agents/validation_agent.py
import json
from .base_agent import BaseAgent

class ValidationAgent(BaseAgent):
    """An agent that performs the final synthesis and validation for a SINGLE claim."""
    
    # --- METHOD SIGNATURE MODIFIED ---
    def validate(self, claim: str, context: str, sources: list[dict]) -> dict | None:
        """
        Synthesizes information to produce a final verdict on a single claim.
        """
        print(f"Agent [Validation]: Now validating the claim: '{claim}'")
        sources_str = json.dumps(sources, indent=2)

        # --- LOGGING: Show validation inputs for this single claim ---
        print("\n--- Validation Agent INPUT ---")
        print(f"Claim to validate: {claim}")
        print(f"Context length: {len(context)} characters.")
        print("------------------------------\n")
        
        # --- CRITICAL CHANGE: Simplified prompt for a single claim ---
        messages = [
            {"role": "system", "content": "You are a meticulous, unbiased fact-checking engine. Your ONLY source of truth is the 'FULL CONTEXT FROM SOURCES' provided by the user. You MUST NOT use any external knowledge. Your task is to validate a single claim based ONLY on this provided text."},
            {"role": "user", "content": f"""
            Please validate the single claim below based *exclusively* on the provided context.

            **CLAIM TO VALIDATE:**
            "{claim}"

            **FULL CONTEXT FROM SOURCES (Your only source of truth):**
            <context>
            {context}
            </context>

            **INSTRUCTIONS (Follow these steps PRECISELY):**
            1.  Meticulously scan the text within the <context> tags to find relevant information for the claim.
            2.  Create a JSON object with the following keys:
                - "claim": The original claim string: "{claim}".
                - "conclusion": Your verdict. Must be one of: "SUPPORTED", "CONTRADICTED", or "INSUFFICIENT_INFORMATION".
                - "summary": A brief explanation of your reasoning. Explain *why* the evidence supports or contradicts the claim, or why no information was found.
                - "evidence": A list of direct, verbatim quotes from the context that support your conclusion. For each quote, you MUST include the source URL cited in the context block (e.g., "--- Source (URL: http://...) ---"). If no direct evidence is found, this MUST be an empty list [].

            **RULES:**
            - If you cannot find any supporting or contradicting text for the claim within the <context>, you MUST set the conclusion to "INSUFFICIENT_INFORMATION" and provide an empty evidence list.
            - Do not infer or speculate. Your analysis must be based entirely on the provided text.

            Produce only the single JSON object for this one claim. Do not wrap it in any other keys.
            """}
        ]
        
        response = self._send_llm_request(messages)

        # --- LOGGING: Show final validation output for this single claim ---
        print("\n--- Validation Agent OUTPUT ---")
        if response:
            print(json.dumps(response, indent=2))
        else:
            print("Validation agent failed to produce a response for this claim.")
        print("-------------------------------\n")
        
        return response
