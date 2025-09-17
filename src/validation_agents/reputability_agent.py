# agents/reputability_agent.py
from base_agent import BaseAgent

class ReputabilityAgent(BaseAgent):
    """An agent that evaluates the credibility of a list of sources."""
    def evaluate(self, sources: list[dict]) -> list[dict]:
        """Evaluates source credibility and enriches the source list."""
        print("Agent [Reputability]: Evaluating source credibility...")
        source_list_str = "\n".join(f"- {s['title']}: {s['url']}" for s in sources)
        messages = [
            {"role": "system", "content": "You are a media analyst. Evaluate a list of sources and return a JSON object with a 'source_evaluations' key. This key should contain a list of objects, where each object has 'url', 'reputability_score' (1-10, 10 is best), and a brief 'reputability_justification'."},
            {"role": "user", "content": f"Please evaluate the following sources:\n\n---\n{source_list_str}\n---"}
        ]
        response = self._send_llm_request(messages)
        evaluations = response.get('source_evaluations', []) if response else []
        
        eval_map = {e['url']: e for e in evaluations}
        for source in sources:
            if source['url'] in eval_map:
                source.update(eval_map[source['url']])
        return sources