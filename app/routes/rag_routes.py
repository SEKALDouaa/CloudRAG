from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.rag_service import generate_rag_response
from ..models.chat_history import ChatHistory
from ..extentions import db

qa_bp = Blueprint("qa_bp", __name__)

@qa_bp.route("/ask", methods=["POST"])
@jwt_required()
def ask_question():
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' in request body"}), 400

    query = data['query']
    current_user = get_jwt_identity()  # logged-in user email

    try:
        # Pass the user_email here
        response = generate_rag_response(query)

        # Save to chat history
        chat_entry = ChatHistory(
            user_email=current_user,
            question=query,
            answer=response["answer"],
            sources=response.get("ranked_documents", [])
        )
        db.session.add(chat_entry)
        db.session.commit()

        return jsonify({
            "user": current_user,
            "response": response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
