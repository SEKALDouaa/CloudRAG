import base64
from flask import Blueprint, Response, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.document_service import get_document, get_all_documents
from ..schemas.document_schema import DocumentSchema

document_bp = Blueprint("documents", __name__)
document_schema = DocumentSchema()

@document_bp.route("/document/<document_id>", methods=["GET"])
@jwt_required()
def get_document_metadata(document_id):
    doc = get_document(document_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    return document_schema.dump(doc)

@document_bp.route("/document_file/<document_id>", methods=["GET"])
@jwt_required()
def serve_document_file(document_id):
    doc = get_document(document_id)
    if not doc or not doc.file_data:
        return "Not found", 404
    return Response(doc.file_data, mimetype=doc.mime_type)

@document_bp.route("/all_document_files", methods=["GET"])
@jwt_required()
def get_all_document_files():
    files = get_all_documents()
    encoded_files = [base64.b64encode(f).decode("utf-8") for f in files]
    return jsonify(encoded_files)
