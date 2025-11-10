from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.chat_history import ChatHistory
from ..extentions import db

chat_history_bp = Blueprint("chat_history", __name__)

@chat_history_bp.route("/chat/history", methods=["GET"])
@jwt_required()
def get_chat_history():
    """Get chat history for the current user"""
    current_user = get_jwt_identity()
    history = ChatHistory.query.filter_by(user_email=current_user).order_by(ChatHistory.created_at.desc()).all()

    return jsonify([{
        "id": chat.id,
        "question": chat.question,
        "answer": chat.answer,
        "sources": chat.sources,
        "created_at": chat.created_at.isoformat()
    } for chat in history])

@chat_history_bp.route("/chat/history/<int:history_id>", methods=["DELETE"])
@jwt_required()
def delete_chat_history(history_id):
    """Delete a specific chat history entry"""
    current_user = get_jwt_identity()
    chat = ChatHistory.query.filter_by(id=history_id, user_email=current_user).first()

    if not chat:
        return jsonify({"error": "Chat history not found"}), 404

    db.session.delete(chat)
    db.session.commit()

    return jsonify({"message": "Chat history deleted successfully"}), 200

@chat_history_bp.route("/chat/history", methods=["DELETE"])
@jwt_required()
def clear_chat_history():
    """Clear all chat history for the current user"""
    current_user = get_jwt_identity()
    ChatHistory.query.filter_by(user_email=current_user).delete()
    db.session.commit()

    return jsonify({"message": "Chat history cleared successfully"}), 200
