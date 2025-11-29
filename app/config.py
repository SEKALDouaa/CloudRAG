import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()  # Load environment variables from .env file

class Config:
    JWT_SECRET_KEY = os.getenv('SECRET_KEY')
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'db', 'instance', 'resumes.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=5)