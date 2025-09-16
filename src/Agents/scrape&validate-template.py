import os
from openai import OpenAI
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient

# Load environment variables from .env file
load_dotenv()

class AgentTemplate:
    """
    An agent that can autonomously search the web to validate claims
    using the Tavily Search API for up-to-date information.
    """

    def __init__(self, model="openrouter/sonoma-sky-alpha", site_url=None, site_name=None):
        """
        Initializes the agent and its tools (LLM client, Search client).
        """
        # --- LLM Client Initialization ---
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

        # --- Search Client Initialization ---
        tavily_api_key = os.getenv("TAVILY_API_KEY")
        if not tavily_api_key:
            raise ValueError("Tavily API key not found in .env file.")
        self.tavily_client = TavilyClient(api_key=tavily_api_key)

    def _scrape_url(self, url: str) -> str:
        """
        Scrapes and cleans text content from a URL.
        """
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            for element in soup(['script', 'style', 'header', 'footer', 'nav', 'aside']):
                element.decompose()
            return ' '.join(soup.stripped_strings)
        except requests.RequestException as e:
            print(f"Warning: Could not scrape {url}. Reason: {e}")
            return None

    def _send_llm_request(self, messages):
        """
        Sends a request to the LLM.
        """
        return self.client.chat.completions.create(
            extra_headers=self.extra_headers, model=self.model, messages=messages
        ).choices[0].message.content

    def validate_claim(self, claim: str) -> str:
        """
        Autonomously validates a claim by searching the web, reading sources,
        and synthesizing a conclusion.
        """
        print(f"\n--- Validating Claim: '{claim}' ---")
        
        # 1. SEARCH
        print("Step 1: Searching for relevant sources...")
        try:
            search_result = self.tavily_client.search(query=claim, search_depth="advanced")
            source_urls = [res['url'] for res in search_result['results']]
            if not source_urls:
                return "Search did not return any relevant URLs."
            print(f"Found {len(source_urls)} potential sources.")
        except Exception as e:
            return f"An error occurred during the search step: {e}"

        # 2. SCRAPE & READ
        print("Step 2: Scraping and reading content from sources...")
        context = ""
        scraped_count = 0
        for i, url in enumerate(source_urls[:3]): # Scrape top 3 results for brevity
            content = self._scrape_url(url)
            if content:
                context += f"--- Source [{i+1}]: {url} ---\n{content}\n\n"
                scraped_count += 1
        
        if not context:
            return "Could not scrape any content from the found URLs. Cannot validate claim."
        print(f"Successfully scraped {scraped_count} source(s).")
        
        # 3. SYNTHESIZE & VALIDATE
        print("Step 3: Synthesizing information to validate the claim...")
        prompt = f"""
        You are a meticulous fact-checker and research analyst. Your goal is to validate the following claim based *only* on the provided context scraped from web sources.

        Claim to Validate: "{claim}"

        Provided Context from Web Sources:
        {context}

        Instructions:
        1. Carefully read all the provided context.
        2. Determine if the claim is supported, contradicted, or if the information is insufficient to make a clear judgment.
        3. Provide a clear, one-word conclusion at the very top: **Conclusion:** SUPPORTED, **Conclusion:** CONTRADICTED, or **Conclusion:** INSUFFICIENT_INFORMATION.
        4. Write a concise summary explaining your reasoning.
        5. **Crucially**, back up your reasoning with direct quotes from the context.
        6. For each quote, you **must** cite the source number (e.g., [Source 1], [Source 2]).
        """
        
        messages = [
            {"role": "system", "content": "You are a fact-checking research analyst who only uses provided sources."},
            {"role": "user", "content": prompt}
        ]
        
        final_analysis = self._send_llm_request(messages)
        return final_analysis

if __name__ == '__main__':
    try:
        agent = AgentTemplate()

        # --- Example 1: A recent, verifiable tech event ---
        claim_1 = "Microsoft completed its acquisition of Activision Blizzard in October 2023."
        result_1 = agent.validate_claim(claim_1)
        print("\n--- Final Analysis ---")
        print(result_1)

        # --- Example 2: A financial claim that requires up-to-date data ---
        claim_2 = "OpenAI's revenue surpassed $2 billion in December 2023."
        result_2 = agent.validate_claim(claim_2)
        print("\n--- Final Analysis ---")
        print(result_2)

    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")