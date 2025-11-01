from ..extentions import db

class Document(db.Model):
    id = db.Column(db.String, primary_key=True)
    file_name = db.Column(db.String, nullable=True)
    file_data = db.Column(db.LargeBinary, nullable=False)
    mime_type = db.Column(db.String, nullable=False)
    document_type = db.Column(db.String, nullable=True)
    # optional: author, date, tags
    author = db.Column(db.String, nullable=True)
    date = db.Column(db.String, nullable=True)
    tags = db.Column(db.PickleType, nullable=True)  # store as list
