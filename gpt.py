import os
import re
from cerebras.cloud.sdk import Cerebras

def call_gpt(prompt:str) -> tuple[str, str]:
    # Check if API key is set
    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        print("Error: CEREBRAS_API_KEY environment variable is not set")
        print("Please set it using: export CEREBRAS_API_KEY='your-api-key-here'")
        return

    try:
        # Initialize the Cerebras client
        client = Cerebras(api_key=api_key)

        # Create a chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="qwen-3-32b",
        )

        # Get the full response content
        content = chat_completion.choices[0].message.content

        # Parse out the <think>...</think> section and the actual response
        think_match = re.search(r'<think>(.*?)</think>', content, re.DOTALL)
        thinking = think_match.group(1).strip() if think_match else None
        # The response is the text after </think>
        response = content.split('</think>')[-1].strip() if '</think>' in content else content.strip()

        return response, thinking

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    print(call_gpt("say 10 words"))
