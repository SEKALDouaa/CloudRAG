from ..extentions import db
from app.models.user import User

class Document(db.Model):
    id = db.Column(db.String, primary_key=True)
    file_name = db.Column(db.String, nullable=True)
    file_data = db.Column(db.LargeBinary, nullable=False)
    mime_type = db.Column(db.String, nullable=False)
    document_type = db.Column(db.String, nullable=True)
    author = db.Column(db.String, nullable=True)
    date = db.Column(db.String, nullable=True)
    tags = db.Column(db.PickleType, nullable=True)

    # 🔗 Link to User
    user_email = db.Column(db.String(25), db.ForeignKey('user.email'), nullable=False)

    # Relationship (so you can do user.documents or doc.user)
    user = db.relationship("User", backref=db.backref("documents", lazy=True))
