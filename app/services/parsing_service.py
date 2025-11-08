import google.generativeai as genai
import re, ast
from decouple import config
from ..services.user_service import Get_user_llm
from flask_jwt_extended import get_jwt_identity

DEFAULT_API_KEY = config("GEMINI_API_KEY")
DEFAULT_MODEL = "models/gemini-2.5-flash"


def split_text_smartly(raw_text: str, max_tokens=3000):
    
    sections = re.split(r'\n(?=[A-Z\s]{3,}:)', raw_text)
    chunks = []
    current_chunk = ""

    for section in sections:
        section = section.strip()
        if not section:
            continue
        section_tokens = len(section.split())
        current_tokens = len(current_chunk.split())

        if current_tokens + section_tokens <= max_tokens:
            current_chunk += "\n\n" + section if current_chunk else section
        else:
            if current_chunk:
                chunks.append(current_chunk)
            if section_tokens > max_tokens:
                paragraphs = re.split(r'\n\s*\n', section)
                for para in paragraphs:
                    para = para.strip()
                    if not para:
                        continue
                    para_tokens = len(para.split())
                    if len(current_chunk.split()) + para_tokens <= max_tokens:
                        current_chunk += "\n\n" + para if current_chunk else para
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = para
            else:
                current_chunk = section

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


def order_document_into_dictionary_LLM(raw_text: str, max_tokens=3000):

    current_user = str(get_jwt_identity())
    user_settings = Get_user_llm(current_user)

    api_key = user_settings.get("api_key") if user_settings else None
    llm_model = user_settings.get("llm_model") if user_settings else None

    genai.configure(api_key=api_key or DEFAULT_API_KEY)
    model = genai.GenerativeModel(llm_model or DEFAULT_MODEL)

    all_chunks = split_text_smartly(raw_text, max_tokens=max_tokens)
    combined_content = []
    final_metadata = {}
    document_type = "generic"

    for chunk in all_chunks:
        prompt = f"""
        You are a **universal document parser**. Analyze the provided unstructured text and convert it into a **RAG-compliant Python dictionary** for semantic search and retrieval.

        Your output must be a single valid **Python dictionary** (not JSON) following this schema:

        {{
        "document_type": "<inferred type, lowercase>",
        "metadata": {{}},
        "content": [
            {{"section_title": "", "text": ""}}
        ]
        }}

        Here is the chunk of text:
        {chunk}
        """

        response = model.generate_content(prompt)

        text = re.sub(r"^```(?:python)?\s*", "", response.text.strip(), flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)

        match = re.match(r'^\s*\w+\s*=\s*(\{.*\})\s*$', text, re.DOTALL)
        if match:
            text = match.group(1)

        parsed_dict = ast.literal_eval(text.strip())
        combined_content.extend(parsed_dict.get("content", []))

        if not final_metadata:
            final_metadata = parsed_dict.get("metadata", {})
            document_type = parsed_dict.get("document_type", "generic")

    return {
        "document_type": document_type,
        "metadata": final_metadata,
        "content": combined_content
    }
