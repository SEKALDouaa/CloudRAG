from langchain_google_genai import ChatGoogleGenerativeAI
from decouple import config

DEFAULT_MODEL = "models/gemini-2.5-flash"
DEFAULT_API_KEY = config("GEMINI_API_KEY")

def get_user_llm(llm_model=None, api_key=None, temperature=0.2):
    model_name = llm_model or DEFAULT_MODEL
    key = api_key or DEFAULT_API_KEY

    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=key,
        temperature=temperature
    )
