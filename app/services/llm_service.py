from langchain_google_genai import ChatGoogleGenerativeAI
from decouple import config

llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.5-flash",
    google_api_key=config("GEMINI_API_KEY"),
    temperature=0.2
)