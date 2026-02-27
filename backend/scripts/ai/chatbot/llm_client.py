import os
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=r"C:\Users\Patel\OneDrive\Desktop\RAG\.env")

def get_model():
    api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not api_token:
        raise ValueError("HUGGINGFACEHUB_API_TOKEN is not set in environment variables")

    endpoint = HuggingFaceEndpoint(
        repo_id="deepseek-ai/DeepSeek-V3.1",
        task="text-generation",
        huggingfacehub_api_token=api_token,
    )

    llm = ChatHuggingFace(llm=endpoint)
    return llm


def ask_model(prompt: str):
    model = get_model()

    messages = [
        SystemMessage(content=(
            "You are an AI Grain Quality Analyzer Assistant. "
            "Your task is to analyze wheat or other grains based on given parameters like: "
            "moisture level, temperature, humidity, grade, and storage conditions. "
            "Provide output in structured bullet points including:\n"
            "1. Quality Assessment\n"
            "2. Storage Recommendation\n"
            "3. Risk Factors (if any)\n"
            "4. Shelf-life Insight\n"
            "5. Market Advisory (Sell / Store / Monitor)\n"
            "Keep answers short, technical, and practical. "
            "Do NOT answer unrelated questions."
        )),
        HumanMessage(content=prompt)
    ]

    response = model.invoke(messages)
    return response.content


if __name__ == "__main__":
    print("Grain Quality Analyzer AI\nType 'exit' to quit.")
    
    while True:
        user_input = input("You: ")
        
        if user_input.lower() == "exit":
            break
        
        response = ask_model(user_input)
        print(f"\nAnalysis Report:\n{response}\n")
