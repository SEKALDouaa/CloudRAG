from flask import Flask
import os
from app.routes.document_db_routes import document_db_bp
from app.routes.document_routes import document_bp
from app.routes.rag_routes import qa_bp
from app.routes.user_routes import user_bp
from app.routes.chat_history_routes import chat_history_bp
from .extentions import db, ma, cors, jwt
from flask_jwt_extended import JWTManager
from .config import Config
import torch

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
                                                  
    db.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
    jwt.init_app(app)
    
    app.register_blueprint(document_db_bp, url_prefix="/")
    app.register_blueprint(qa_bp, url_prefix="/")
    app.register_blueprint(document_bp, url_prefix="/")
    app.register_blueprint(user_bp, url_prefix='/')
    app.register_blueprint(chat_history_bp, url_prefix='/')

    # Forcer CPU avant tout import de modèles
    os.environ['CUDA_VISIBLE_DEVICES'] = ''
    torch.set_default_device('cpu')

    with app.app_context():
        db.create_all()
    return app
