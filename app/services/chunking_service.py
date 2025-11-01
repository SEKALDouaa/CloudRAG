import uuid
from typing import List, Dict, Any

def add_chunk(chunks, doc_id, text, section_title, image_url=None, extra_metadata=None):
    """Add a single text chunk with metadata."""
    if not text.strip():
        return chunks

    chunk_id = str(uuid.uuid4())
    metadata = {
        "doc_id": doc_id,
        "section_title": section_title,
    }

    if image_url:
        metadata["image_url"] = image_url

    if extra_metadata:
        metadata.update(extra_metadata)

    chunks.append({
        "id": chunk_id,
        "text": text.strip(),
        "metadata": metadata
    })
    return chunks


def chunk_document(doc_dict: Dict[str, Any], image_url: str = None):
    """
    Convert a parsed document dictionary (from LLM) into RAG-ready chunks.
    """
    chunks = []
    doc_id = str(uuid.uuid4())

    # Extract metadata and document type
    doc_type = doc_dict.get("document_type", "unknown")
    metadata = doc_dict.get("metadata", {})
    content_list = doc_dict.get("content", [])

    # Add a global metadata baseline
    base_metadata = {"document_type": doc_type, **metadata}

    # Loop through sections and add chunks
    for section in content_list:
        section_title = section.get("section_title", "Untitled Section")
        text = section.get("text", "")
        chunks = add_chunk(chunks, doc_id, text, section_title, image_url, base_metadata)

    return chunks, doc_id
