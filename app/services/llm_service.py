from langchain_google_genai import ChatGoogleGenerativeAI
from decouple import config
import os

DEFAULT_MODEL = "models/gemini-2.5-flash"

def get_default_api_key():
    """Lazy load the API key to allow app startup without it"""
    return os.getenv("GEMINI_API_KEY") or config("GEMINI_API_KEY", default=None)

def get_user_llm(llm_model=None, api_key=None, temperature=0.2):
    model_name = llm_model or DEFAULT_MODEL
    key = api_key or get_default_api_key()
    
    if not key:
        raise ValueError("GEMINI_API_KEY not provided. Please set the GEMINI_API_KEY environment variable or provide an api_key parameter.")

    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=key,
        temperature=temperature
    )
