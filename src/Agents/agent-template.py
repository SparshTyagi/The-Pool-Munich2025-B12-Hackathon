import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class AgentTemplate:
    """
    A base agent template that connects to the OpenRouter API,
    loading the API key from a .env file.
    """

    def __init__(self, model="openrouter/sonoma-sky-alpha", site_url=None, site_name=None):
        """
        Initializes the agent.

        Args:
            model (str): The model identifier to use from OpenRouter.
            site_url (str): Your site URL for rankings on OpenRouter (optional).
            site_name (str): Your site title for rankings on OpenRouter (optional).
        """
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise ValueError(
                "OpenRouter API key not found. Please create a .env file and add OPENROUTER_API_KEY=<YOUR_KEY>."
            )

        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        self.model = model
        self.extra_headers = {}
        if site_url:
            self.extra_headers["HTTP-Referer"] = site_url
        if site_name:
            self.extra_headers["X-Title"] = site_name

    def chat(self, messages):
        """
        Sends a chat completion request to the specified model.

        Args:
            messages (list): A list of message dictionaries, following the
                             OpenAI chat completions format.

        Returns:
            str: The content of the response message.
        """
        completion = self.client.chat.completions.create(
            extra_headers=self.extra_headers,
            model=self.model,
            messages=messages
        )
        return completion.choices[0].message.content

if __name__ == '__main__':
    # Example usage of the AgentTemplate

    try:
        # Initialize the agent. The API key is loaded automatically from the .env file.
        # You can specify any supported model from OpenRouter.
        agent = AgentTemplate(
            model="openrouter/sonoma-sky-alpha",
            site_url="<YOUR_SITE_URL>",
            site_name="<YOUR_SITE_NAME>"
        )

        # --- Example 1: Text-only input ---
        print("--- Text-only Example ---")
        text_messages = [
            {
                "role": "user",
                "content": "What are the main advantages of using a large language model?",
            }
        ]
        response = agent.chat(text_messages)
        print(f"Response: {response}\n")

        # --- Example 2: Image input ---
        print("--- Image Example ---")
        image_messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What is in this image?"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                        }
                    }
                ]
            }
        ]
        response = agent.chat(image_messages)
        print(f"Response: {response}")

    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")