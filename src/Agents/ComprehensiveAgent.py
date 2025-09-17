import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from tavily import TavilyClient

# Load environment variables from .env file
load_dotenv()

class ComprehensiveAgentV5:
    """
    A multi-agent system that intelligently validates multiple claims within a body of text.
    It uses LLM agents for reasoning and planning to minimize costly search operations.
    """

    def __init__(self, model="openrouter/sonoma-sky-alpha", site_url=None, site_name=None):
        openrouter_api_key = os.getenv("API_KEY")
        if not openrouter_api_key:
            raise ValueError("OpenRouter API key not found in .env file.")
        
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=openrouter_api_key,
        )
        self.model = model
        self.extra_headers = {}
        if site_url: self.extra_headers["HTTP-Referer"] = site_url
        if site_name: self.extra_headers["X-Title"] = site_name

        tavily_api_key = os.getenv("TAVILY_API_KEY")
        if not tavily_api_key:
            raise ValueError("Tavily API key not found in .env file.")
        self.tavily_client = TavilyClient(api_key=tavily_api_key)

    def _send_llm_request(self, messages):
        """A standardized way to call the LLM and parse JSON."""
        try:
            response = self.client.chat.completions.create(
                extra_headers=self.extra_headers,
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"}
            ).choices[0].message.content
            return json.loads(response)
        except (json.JSONDecodeError, TypeError) as e:
            print(f"Error decoding LLM response: {e}\nRaw response: {response}")
            return None
        except Exception as e:
            print(f"An unexpected error occurred during LLM request: {e}")
            return None

    # --- AGENT IMPLEMENTATIONS ---

    def _decompose_text_into_claims(self, text: str) -> list[str]:
        """[DecomposerAgent] Breaks a paragraph into a list of atomic claims."""
        print("Agent [Decomposer]: Breaking down text into individual claims...")
        messages = [
            {"role": "system", "content": "You are a helpful assistant that extracts individual, verifiable claims from a block of text. Output a JSON object with a 'claims' key containing a list of strings."},
            {"role": "user", "content": f"Extract the individual claims from the following text:\n\n---\n{text}\n---"}
        ]
        response = self._send_llm_request(messages)
        return response.get('claims', []) if response else []

    def _create_search_plan(self, claims: list[str]) -> list[str]:
        """[PlannerAgent] Creates an efficient list of search queries."""
        print("Agent [Planner]: Creating an efficient search plan...")
        claims_str = "\n".join(f"- {c}" for c in claims)
        messages = [
            {"role": "system", "content": "You are a research strategist. Your job is to create a concise and efficient list of search engine queries to validate a list of claims. Combine related claims into a single query to minimize searches. Output a JSON object with a 'queries' key containing a list of strings."},
            {"role": "user", "content": f"Based on the following claims, what are the optimal search queries?\n\n---\n{claims_str}\n---"}
        ]
        response = self._send_llm_request(messages)
        return response.get('queries', []) if response else []

    def _execute_search_plan(self, queries: list[str]) -> tuple[str, list[dict]]:
        """[SearchAgent] Executes searches and gathers content."""
        print(f"Agent [Search]: Executing {len(queries)} search(es)...")
        consolidated_context = ""
        unique_sources = {}
        for query in queries:
            try:
                search_result = self.tavily_client.search(
                    query=query, search_depth="basic", max_results=4, include_raw_content=True
                )
                for res in search_result['results']:
                    if res.get('url') and res['url'] not in unique_sources:
                        unique_sources[res['url']] = {'title': res.get('title'), 'url': res.get('url')}
                        if res.get('raw_content'):
                            consolidated_context += f"--- Source (URL: {res['url']}) ---\n{res['raw_content']}\n\n"
            except Exception as e:
                print(f"Warning: Search for query '{query}' failed: {e}")
        return consolidated_context, list(unique_sources.values())

    def _evaluate_source_reputability(self, sources: list[dict]) -> list[dict]:
        """[ReputabilityAgent] Evaluates the credibility of each source."""
        print("Agent [Reputability]: Evaluating source credibility...")
        source_list_str = "\n".join(f"- {s['title']}: {s['url']}" for s in sources)
        messages = [
            {"role": "system", "content": "You are a media analyst. Evaluate a list of sources and return a JSON object with a 'source_evaluations' key. This key should contain a list of objects, where each object has 'url', 'reputability_score' (1-10, 10 is best), and a brief 'reputability_justification'."},
            {"role": "user", "content": f"Please evaluate the following sources:\n\n---\n{source_list_str}\n---"}
        ]
        response = self._send_llm_request(messages)
        evaluations = response.get('source_evaluations', []) if response else []
        
        # Merge evaluations back into the original source list
        eval_map = {e['url']: e for e in evaluations}
        for source in sources:
            if source['url'] in eval_map:
                source.update(eval_map[source['url']])
        return sources

    def _validate_claims_against_context(self, claims: list[str], context: str, sources: list[dict]) -> dict:
        """[ValidationAgent] Performs the final synthesis and validation."""
        print("Agent [Validation]: Synthesizing all information for the final verdict...")
        claims_str = "\n".join(f"- {c}" for c in claims)
        sources_str = json.dumps(sources, indent=2)
        messages = [
            {"role": "system", "content": "You are a meticulous fact-checking analyst. Your task is to validate a list of claims based ONLY on the provided context and source reputability evaluations. Output a JSON object with a 'validation_results' key containing a list of objects, one for each claim."},
            {"role": "user", "content": f"""
            Please validate each of the following claims based on the provided context and source information. For each claim, provide a conclusion, a summary, and cite the supporting evidence directly from the context.

            **CLAIMS TO VALIDATE:**
            {claims_str}

            **EVALUATED SOURCES:**
            {sources_str}

            **FULL CONTEXT FROM SOURCES:**
            {context}

            **INSTRUCTIONS:**
            For each claim, create a JSON object with the following keys:
            - "claim": The original claim string.
            - "conclusion": "SUPPORTED", "CONTRADICTED", "SPECULATIVE", or "INSUFFICIENT_INFORMATION".
            - "summary": Your detailed analysis of the claim based on the evidence.
            - "evidence": A list of direct quotes from the context that informed your conclusion, including the source URL for each quote.
            """}
        ]
        return self._send_llm_request(messages)

    # --- ORCHESTRATOR ---
    def validate_claims_from_text(self, text: str) -> dict:
        """
        [OrchestratorAgent] Manages the full, multi-agent validation workflow.
        """
        # 1. Decompose
        claims = self._decompose_text_into_claims(text)
        if not claims:
            return {"error": "Could not decompose text into claims."}
        print(f"Successfully decomposed into {len(claims)} claims.")

        # 2. Plan
        queries = self._create_search_plan(claims)
        if not queries:
            return {"error": "Could not create a search plan."}
        print(f"Optimized plan created with {len(queries)} queries.")

        # 3. Search
        context, sources = self._execute_search_plan(queries)
        if not context:
            return {"error": "Failed to retrieve any content from sources."}
        print(f"Retrieved content from {len(sources)} unique sources.")
        
        # 4. Evaluate Reputability
        evaluated_sources = self._evaluate_source_reputability(sources)

        # 5. Validate
        final_report = self._validate_claims_against_context(claims, context, evaluated_sources)
        
        return final_report


if __name__ == '__main__':
    agent = ComprehensiveAgentV5()
    
    complex_text = """
    People are saying that OpenAI's annualized revenue reportedly crossed $3.4 billion in mid-2024,
    which is an incredible number. I also heard that in 2026 it will be the biggest tech company
    in the world, bigger than Apple and Microsoft. And its main competitor isn't Google, it's Anthropic.
    """
    
    final_analysis = agent.validate_claims_from_text(complex_text)

    print("\n--- FINAL COMPREHENSIVE REPORT ---")
    if final_analysis:
        print(json.dumps(final_analysis, indent=2))
    else:
        print("The analysis could not be completed.")