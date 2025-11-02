from .text_extraction_service import extract_text
from .parsing_service import order_document_into_dictionary_LLM
from .chunking_service import chunk_document
from .embedding_service import embed_texts
from .vectorstore_service import add_to_vectorstore
from .document_service import save_document

def process_document_pipeline(document_path: str, document_url: str = "", user_email: str = None) -> str:
    raw_text = extract_text(document_path)
    doc_dict = order_document_into_dictionary_LLM(raw_text)
    chunks, doc_id = chunk_document(doc_dict, document_url)
    
    # Pass the user_email to save_document
    save_document(doc_id, document_path, user_email=user_email)
    
    texts = [chunk["text"] for chunk in chunks]
    ids = [chunk["id"] for chunk in chunks]
    metadatas = [{**chunk["metadata"], "user_email": user_email} for chunk in chunks]
    
    # Pass the user_email to add_to_vectorstore
    embeddings = embed_texts(texts)
    add_to_vectorstore(texts, ids, metadatas, embeddings, user_email=user_email)

    return doc_id
