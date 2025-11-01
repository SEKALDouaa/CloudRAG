from langchain_google_genai import ChatGoogleGenerativeAI
from decouple import config

llm = ChatGoogleGenerativeAI(
    model="models/gemini-1.5-flash-latest",
    google_api_key=config("GEMINI_API_KEY"),
    temperature=0.2
)