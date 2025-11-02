import google.generativeai as genai
import re, ast
from decouple import config

genai.configure(api_key=config("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-pro")


def split_text_smartly(raw_text: str, max_tokens=3000):
    """
    Split text into chunks without breaking sections or paragraphs.
    """
    # Detect section boundaries (lines ending with ':' or all caps)
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
            # If section is too big, split by paragraph
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
    """
    Converts raw text to a RAG-compliant Python dictionary.
    Handles long documents by splitting into smart chunks for Gemini.
    Returns a single dictionary exactly like the original function.
    """
    all_chunks = split_text_smartly(raw_text, max_tokens=max_tokens)
    combined_content = []
    final_metadata = {}
    document_type = "generic"

    for chunk in all_chunks:
        # Use your original full prompt
        prompt = f"""
        You are a **universal document parser**. Analyze the provided unstructured text and convert it into a **RAG-compliant Python dictionary** for semantic search and retrieval.

        Your output must be a single valid **Python dictionary** (not JSON) following this schema:

        {{
        "document_type": "<inferred type, lowercase>",
        "metadata": {{
            "source_name": "",            
            "author": "",
            "date": "",
            "language": "",
        }},
        "content": [
            {{
            "section_title": "",
            "text": ""
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

        Here is the chunk of text:
        {chunk}
        """

        response = model.generate_content(prompt)

        # Clean any code fences
        text = re.sub(r"^```(?:python)?\s*", "", response.text.strip(), flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)

        # Extract dictionary if wrapped in assignment
        match = re.match(r'^\s*\w+\s*=\s*(\{.*\})\s*$', text, re.DOTALL)
        if match:
            text = match.group(1)

        parsed_dict = ast.literal_eval(text.strip())

        # Merge content from each chunk
        combined_content.extend(parsed_dict.get("content", []))

        # Capture metadata and document_type from first chunk only
        if not final_metadata:
            final_metadata = parsed_dict.get("metadata", {})
            document_type = parsed_dict.get("document_type", "generic")

    # Return a single dictionary exactly like the original function
    return {
        "document_type": document_type,
        "metadata": final_metadata,
        "content": combined_content
    }
