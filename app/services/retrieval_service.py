from app.services.embedding_service import embed_query
from app.services.vectorstore_service import query_vectorstore
from langchain.schema import Document

def retrieve_documents(query: str, user_email: str, k=5):
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
        if document_id != "unknown_document":
            metadata["document_url"] = f"http://localhost:5000/document_file/{document_id}"
        grouped.setdefault(document_id, []).append(text)

    grouped_docs = []

    for document_id, texts in grouped.items():
        full_text = "\n\n---\n\n".join(texts)
        grouped_docs.append(
            Document(
                page_content=full_text,
                metadata={
                    "document_id": document_id,
                    "document_url": f"http://localhost:5000/document/{document_id}",
                    "num_chunks": len(texts),
                    "user_email": user_email
                }
            )
        )

    grouped_docs.sort(key=lambda d: d.metadata["num_chunks"], reverse=True)

    return grouped_docs