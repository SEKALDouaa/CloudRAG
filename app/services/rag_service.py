from app.services.llm_service import llm
from app.services.retrieval_service import retrieve_documents
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.schema import BaseRetriever

class CustomRetriever(BaseRetriever):
    # Wraps our retrieval logic for LangChain
    def get_relevant_documents(self, query: str):
        return retrieve_documents(query)


# Prompt: structured and ranking-focused (document-agnostic)
prompt_template = """
You are a helpful assistant that answers questions about documents.

The user asked: {question}

You are given excerpts (chunks) from documents.
Use **only** the information explicitly stated in these excerpts to answer the question.
If the answer is not contained in the provided excerpts, respond with "Not available in the provided context".

Do not invent or assume any additional information. Focus strictly on what is present in the provided context.

Answer the question **in the same language it was asked**.

Excerpts:
{context}

Answer:
"""


# Instantiate retriever and chain
retriever = CustomRetriever()
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type="stuff",
    return_source_documents=True,
    chain_type_kwargs={
        "prompt": PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
    }
)


def generate_rag_response(query: str):
    # Get both the LLM’s answer and the raw source docs
    result = qa_chain.invoke({"query": query})

    answer_text = result["result"]
    source_docs = result.get("source_documents", [])

    # Build a structured mapping of documents
    ranked_documents = []
    for idx, doc in enumerate(source_docs, start=1):
        doc_entry = {
            "rank": idx,
            "document_id": doc.metadata.get("document_id", f"doc_{idx}"),
            "document_url": doc.metadata.get("document_url", None),
            "text_excerpt": doc.page_content[:300]  # optional preview
        }
        ranked_documents.append(doc_entry)

    return {
        "answer": answer_text,            # LLM summary & ranking
        "ranked_documents": ranked_documents  # ordered list with IDs + URLs
    }
