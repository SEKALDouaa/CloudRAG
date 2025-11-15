from ..extentions import db
from datetime import datetime

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_email = db.Column(db.String(25), db.ForeignKey('user.email'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    sources = db.Column(db.PickleType, nullable=True)  # Store ranked_documents as pickle
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = db.relationship("User", backref=db.backref("chat_history", lazy=True))
