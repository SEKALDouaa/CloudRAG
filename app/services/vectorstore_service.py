import chromadb

chroma_client = chromadb.PersistentClient(path="chroma_db")
collection = chroma_client.get_or_create_collection(name='resumes')

def add_to_vectorstore(texts, ids, metadatas, embeddings):
    collection.add(documents=texts, metadatas=metadatas, ids=ids, embeddings=embeddings)

def query_vectorstore(query_embedding, k=5):
    results = collection.query(query_embeddings=query_embedding, n_results=k)
    return list(zip(results["documents"][0], results["metadatas"][0]))