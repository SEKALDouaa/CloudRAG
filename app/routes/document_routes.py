from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.treatment_pipeline_service import process_document_pipeline  # rename this to something like process_document_pipeline if desired
import traceback
import os

document_bp = Blueprint("document", __name__)

@document_bp.route("/process-document", methods=["POST"])
@jwt_required()
def process_document():
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist("files")
    processed_documents = []
    current_user = get_jwt_identity()

    try:
        for file in files:
            file_path = f"/tmp/{file.filename}"
            file.save(file_path)

            document_url = request.form.get("document_url", "")

            document_id = process_document_pipeline(
                file_path,
                document_url=document_url
            )

            processed_documents.append({
                "filename": file.filename,
                "document_id": document_id,
                "document_url": document_url
            })

        return jsonify({
            "message": f"{len(processed_documents)} documents processed successfully",
            "user": current_user,
            "documents": processed_documents
        })

    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({"error": str(e), "traceback": tb}), 500
