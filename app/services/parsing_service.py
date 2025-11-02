import google.generativeai as genai
import re, ast
from decouple import config

genai.configure(api_key=config("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-pro")

def order_document_into_dictionary_LLM(raw_text: str):
    prompt = f"""
    You are a **universal document parser**. Analyze the provided unstructured text and convert it into a **RAG-compliant Python dictionary** for semantic search and retrieval.

    Your output must be a single valid **Python dictionary** (not JSON) following this schema:

    {{
    "document_type": "<inferred type, lowercase>",
    "metadata": {{
        "source_name": "",            # e.g. filename or source system
        "author": "",
        "date": "",
        "language": "",
    }},
    "content": [
        {{
        "section_title": "",        # section/heading if any
        "text": ""                  # plain cleaned text of that section
        }}
    ]
    }}

    ### Rules:
    1. Identify the **document type** (resume, invoice, contract, report, email, receipt, generic...).
    2. Always fill `"document_type"` and `"content"`.
    3. `"metadata"` fields can be empty strings/lists if not found.
    4. Each logical part, heading, or paragraph should become one entry in `"content"`.
    5. Do **not** embed nested lists or objects inside `"content"` — keep it flat (for embedding).
    6. Do not invent missing information.
    7. Clean extra whitespace but preserve logical line breaks.
    8. Output **only** the Python dictionary literal — no commentary, markdown, or code fences.

    Example:
    {{
    "document_type": "contract",
    "metadata": {{
        "source_name": "contract_123.pdf",
        "author": "John Doe",
        "date": "June 5, 2024",
        "language": "en",
        "tags": ["agreement", "services"]
    }},
    "content": [
        {{"section_title": "Introduction", "text": "This agreement is made between..."}},
        {{"section_title": "Terms", "text": "The client agrees to..."}},
        {{"section_title": "Termination", "text": "Either party may terminate..."}}
    ]
    }}

    Here is the document text:
    {raw_text}
    """


    response = model.generate_content(prompt)

    text = re.sub(r"^```(?:python)?\s*", "", response.text.strip(), flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    match = re.match(r'^\s*\w+\s*=\s*(\{.*\})\s*$', text, re.DOTALL)
    if match:
        text = match.group(1)

    return ast.literal_eval(text.strip())
