from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..services.user_service import Create_user, Get_user_by_email, Update_user_llm
from ..schemas.user_schema import UserSchema


user_bp = Blueprint('user', __name__)
user_schema = UserSchema()

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # Hash the password before sending to the service
    data['password'] = generate_password_hash(data['password'])

    user = Create_user(data)
    if user is None:
        return jsonify({"message": "User already exists"}), 400

    return jsonify({"message": "User registered successfully"}), 201


@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Get_user_by_email(data['email'])

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.email)
    return jsonify(access_token=access_token, email=user.email), 200

@user_bp.route('/update-llm', methods=['PUT'])
@jwt_required()
def update_llm():
    data = request.get_json()
    current_user_email = get_jwt_identity()

    llm_model = data.get("llm_model")
    api_key = data.get("api_key")

    user = Update_user_llm(current_user_email, llm_model=llm_model, api_key=api_key)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "LLM settings updated successfully"}), 200
