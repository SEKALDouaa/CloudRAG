from .text_extraction_service import extract_text
from .parsing_service import order_document_into_dictionary_LLM
from .chunking_service import chunk_document
from .embedding_service import embed_texts
from .vectorstore_service import add_to_vectorstore
from .document_service import save_document

def process_resume_pipeline(document_path: str, document_url: str = "") -> str:
    raw_text = extract_text(document_path)
    doc_dict = order_document_into_dictionary_LLM(raw_text)
    chunks, doc_id = chunk_document(doc_dict, document_url)
    
    save_document(doc_id, document_path)
    
    texts = [chunk["text"] for chunk in chunks]
    ids = [chunk["id"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]
    
    embeddings = embed_texts(texts)
    add_to_vectorstore(texts, ids, metadatas, embeddings)

    return doc_id