from app.services.embedding_service import embed_query
from app.services.vectorstore_service import query_vectorstore
from app.services.document_service import get_document
from app.services.document_service import get_all_documents_metadata
from langchain.schema import Document
import re
from typing import List

def map_filenames_to_ids(filenames: List[str], user_email: str) -> List[str]:
    """
    Given a list of filenames (from @mentions), return the corresponding file_ids for the user.
    """
    all_docs = get_all_documents_metadata(user_email)
    filename_to_id = {doc.file_name: doc.id for doc in all_docs}
    ids = []
    for f in filenames:
        if f in filename_to_id:
            ids.append(filename_to_id[f])
    return ids

def extract_mentioned_documents(query: str) -> List[str]:
    """
    Detect if the user mentioned documents using @document_id syntax.
    Returns a list of document IDs mentioned in the query.
    """
    return re.findall(r"@(\S+)", query)

def retrieve_documents(query: str, user_email: str, k=5, specific_doc_ids: List[str] = None):
    """
    Retrieve documents relevant to the query, filtered by the user.

    Args:
        query (str): User's query text.
        user_email (str): Email of the logged-in user.
        k (int): Number of results to return.

    Returns:
        List[Document]: LangChain Document objects with metadata.
    """
    query_embedding = embed_query(query)
    raw_results = query_vectorstore(query_embedding, user_email, k)

    # Group chunks by document_id but only include those belonging to the user
    grouped = {}
    for text, metadata in raw_results:
        # Filter by user
        if metadata.get("user_email") != user_email:
            continue

        document_id = metadata.get("doc_id", "unknown_document")

        if specific_doc_ids and document_id not in specific_doc_ids:
            continue
        
        if document_id != "unknown_document":
            metadata["document_url"] = f"http://localhost:5000/document_file/{document_id}"
        grouped.setdefault(document_id, []).append(text)

    grouped_docs = []

    for document_id, texts in grouped.items():
        full_text = "\n\n---\n\n".join(texts)

        # Get document metadata to retrieve file_name
        doc_info = get_document(document_id, user_email)
        file_name = doc_info.file_name if doc_info else document_id

        grouped_docs.append(
            Document(
                page_content=full_text,
                metadata={
                    "document_id": document_id,
                    "file_name": file_name,
                    "document_url": f"http://localhost:5000/document_file/{document_id}",
                    "num_chunks": len(texts),
                    "user_email": user_email
                }
            )
        )

    grouped_docs.sort(key=lambda d: d.metadata["num_chunks"], reverse=True)

    return grouped_docs