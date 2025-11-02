import chromadb

# Persistent Chroma client
chroma_client = chromadb.PersistentClient(path="app/db/chroma_db")


def get_user_collection(user_email: str):
    """
    Retrieve or create a user-specific collection to isolate embeddings per user.
    """
    print("DEBUG: user_email before replace =", user_email, type(user_email))
    # You can sanitize the name to avoid special character issues
    safe_name = user_email.replace("@", "_at_").replace(".", "_")
    collection_name = f"documents_{safe_name}"
    return chroma_client.get_or_create_collection(name=collection_name)


def add_to_vectorstore(texts, ids, metadatas, embeddings, user_email: str):
    """
    Add embedded documents to the vectorstore for a specific user.
    """
    collection = get_user_collection(user_email)
    collection.add(
        documents=texts,
        metadatas=metadatas,
        ids=ids,
        embeddings=embeddings
    )


def query_vectorstore(query_embedding, user_email: str, k=5):
    """
    Query a user’s personal vectorstore collection.
    """
    collection = get_user_collection(user_email)
    results = collection.query(query_embeddings=query_embedding, n_results=k)

    # Return list of (document, metadata) pairs
    return list(zip(results["documents"][0], results["metadatas"][0]))
