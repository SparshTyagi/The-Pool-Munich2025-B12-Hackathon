import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from tavily import TavilyClient

# Load environment variables from .env file
load_dotenv()

# Template
ReportTemplatePath = "./util/ReportTemplate.json"

class ReportBuilderAgent:
    """
     Our Agent that summarizes the found results and puts it into a report form.
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

    def combine_results(self, results: list):
        print("Agent [Combiner]: Putting results together.")
        messages = [
            {"role": "system",
             "content": "You are an professional investor bot used in the process of evaluating startups. It is critical that you work precise and fact based."},
            {"role": "user", "content": f"Summarize the provided results from your collegues into a pdf using the provided layout\n\n-"
                                        f"RESULTS"
                                        f"--\n{results}\n---"
                                        f"LAYOUT"
                                        f"--\n{self.load_template(ReportTemplatePath)}\n---"
             }

        ]
        return self._send_llm_request(messages)

    def create_report_file(self, resultText):
        print("Agent [Reporter]: Creating report file.")
        return

    def load_template(self, file_path):
        """Lädt eine JSON-Datei und gibt deren Inhalt zurück."""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            return data
        except FileNotFoundError:
            print(f"Error: Die Datei {file_path} wurde nicht gefunden.")
            return None
        except json.JSONDecodeError:
            print(f"Error: Die Datei {file_path} enthält kein gültiges JSON.")
            return None



if __name__ == '__main__':
    agent = ReportBuilderAgent()

    result_text = """
    People are saying that OpenAI's annualized revenue reportedly crossed $3.4 billion in mid-2024,
    which is an incredible number. I also heard that in 2026 it will be the biggest tech company
    in the world, bigger than Apple and Microsoft. And its main competitor isn't Google, it's Anthropic.
    """

    final_analysis = agent.combine_results(result_text)

    print("\n--- FINAL COMPREHENSIVE REPORT ---")
    if final_analysis:
        print(json.dumps(final_analysis, indent=2))
    else:
        print("The analysis could not be completed.")