import mimetypes
from ..models.document import Document
from ..extentions import db

def save_document(file_id: str, file_path: str, document_type: str = "", extra_metadata: dict = None):
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    file_name = file_path.split("/")[-1]

    # Combine extra metadata if provided
    metadata = extra_metadata or {}
    
    doc = Document(
        id=file_id,
        file_name=file_name,
        file_data=file_bytes,
        mime_type=mime_type,
        document_type=document_type,
        **metadata
    )
    db.session.merge(doc)  # insert or update
    db.session.commit()

def get_document(file_id: str):
    return Document.query.get(file_id)


def get_all_documents():
    docs = Document.query.with_entities(Document.file_data).all()
    return [file_data for (file_data,) in docs]
