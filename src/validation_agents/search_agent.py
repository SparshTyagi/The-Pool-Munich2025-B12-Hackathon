# agents/search_agent.py
from tavily import TavilyClient

class SearchAgent:
    """An agent dedicated to executing search queries using the Tavily API."""
    def __init__(self, api_key: str):
        self.client = TavilyClient(api_key=api_key)

    def search(self, queries: list[str]) -> tuple[str, list[dict]]:
        """Executes searches, consolidates content, and de-duplicates sources."""
        print(f"Agent [Search]: Executing {len(queries)} search(es)...")
        consolidated_context = ""
        unique_sources = {}
        for query in queries:
            try:
                search_result = self.client.search(
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