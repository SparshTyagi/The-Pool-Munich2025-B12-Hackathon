# src/validation_agents/search_agent.py
from tavily import TavilyClient
import time

class SearchAgent:
    """An agent dedicated to executing search queries using the Tavily API."""
    def __init__(self, api_key: str):
        self.client = TavilyClient(api_key=api_key)

    def search(self, queries: list[str]) -> tuple[str, list[dict]]:
        """Executes searches, consolidates content, and de-duplicates sources."""
        print(f"Agent [Search]: Executing {len(queries)} search(es)...")
        consolidated_context = ""
        unique_sources = {}
        
        for i, query in enumerate(queries):
            print(f"\n--- Searching Query {i+1}/{len(queries)}: '{query}' ---")
            attempts = 0
            max_attempts = 3
            wait_time = 2

            while attempts < max_attempts:
                try:
                    search_result = self.client.search(
                        query=query, search_depth="advanced", max_results=5, include_raw_content=True
                    )
                    
                    # --- LOGGING: Show search results for the query ---
                    print(f"Found {len(search_result.get('results', []))} results for query.")

                    for res in search_result.get('results', []):
                        if res.get('url') and res['url'] not in unique_sources:
                            unique_sources[res['url']] = {'title': res.get('title'), 'url': res.get('url')}
                            if res.get('raw_content'):
                                consolidated_context += f"--- Source (URL: {res['url']}) ---\n{res['raw_content']}\n\n"
                    break 
                except Exception as e:
                    attempts += 1
                    print(f"Warning: Search for query '{query}' failed on attempt {attempts}/{max_attempts}. Error: {e}")
                    if attempts < max_attempts:
                        print(f"Retrying in {wait_time} seconds...")
                        time.sleep(wait_time)
                    else:
                        print(f"Error: All search attempts for query '{query}' failed.")
        
        # --- LOGGING: Show final search output ---
        print("\n--- Search Agent FINAL OUTPUT ---")
        print(f"Retrieved content from {len(unique_sources)} unique sources.")
        print(f"Total consolidated context length: {len(consolidated_context)} characters.")
        print("---------------------------------\n")
        
        return consolidated_context, list(unique_sources.values())