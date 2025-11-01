import mimetypes
from ..models.document import Document
from ..extentions import db

def save_document(file_id: str, file_path: str, user_email: str, document_type: str = "", extra_metadata: dict = None):
    """
    Save a document in the database linked to a specific user.
    """
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    file_name = file_path.split("/")[-1]

    # Combine extra metadata if provided
    metadata = extra_metadata or {}

    # ✅ Include user linkage
    doc = Document(
        id=file_id,
        file_name=file_name,
        file_data=file_bytes,
        mime_type=mime_type,
        document_type=document_type,
        user_email=user_email,  # link document to the logged-in user
        **metadata
    )

    db.session.merge(doc)  # insert or update
    db.session.commit()

    return doc.id


def get_document(file_id: str, user_email: str):
    """
    Retrieve a specific document belonging to a given user.
    """
    return Document.query.filter_by(id=file_id, user_email=user_email).first()


def get_all_documents(user_email: str):
    """
    Retrieve all documents belonging to a given user.
    """
    docs = Document.query.filter_by(user_email=user_email).with_entities(Document.file_data).all()
    return [file_data for (file_data,) in docs]
