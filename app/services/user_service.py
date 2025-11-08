from ..models.user import User
from ..extentions import db
from datetime import datetime

def Create_user(data):
    existing_user = User.query.filter_by(email=data.get('email')).first()
    if existing_user:
        return None
    
    if 'dateNaissance' in data:
        data['dateNaissance'] = datetime.strptime(data['dateNaissance'], "%Y-%m-%d").date()

    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return user

def Get_user_by_email(user_email):
    user = User.query.filter_by(email=user_email).first()
    return user

def Update_user_llm(email, llm_model=None, api_key=None):
    user = User.query.get(email)
    if not user:
        return None

    if llm_model is not None:
        user.llm_model = llm_model
    if api_key is not None:
        user.api_key = api_key

    db.session.commit()
    return user


def Get_user_llm(email):
    user = User.query.get(email)
    if not user:
        return None

    return {
        "llm_model": user.llm_model,
        "api_key": user.api_key
    }