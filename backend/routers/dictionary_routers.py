from fastapi import APIRouter, Depends, status, Header, HTTPException
import requests
from dotenv import load_dotenv
import os
import re
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Word
from utils.auth_utils import verify_access_token

load_dotenv()

DICTIONARY_API_KEY = os.getenv("DICTIONARY_API_KEY")

router = APIRouter(prefix="/api", tags=["dictionary"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    token = authorization.replace("Bearer ", "")
    user_id = verify_access_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return int(user_id)

@router.get("/enter")
def enter_word(word: str, user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if word already exists in DB
    existing_word = db.query(Word).filter(Word.user_id == user_id, Word.word == word).first()
    if existing_word:
        return {
            "word": existing_word.word,
            "meaning": existing_word.meaning,
            "example": existing_word.example,
            "source": "database"
        }

    # Fetch word meaning from a dictionary API
    url = f"https://www.dictionaryapi.com/api/v3/references/thesaurus/json/{word}?key={DICTIONARY_API_KEY}"
    res = requests.get(url)

    if res.status_code != 200:
        return {"error": "Word not found"}
    
    data = res.json()
    if not data or not isinstance(data, list):
        return {"error": "Invalid response from dictionary API"}

    entry = data[0]

    # Extract short definition
    meaning = entry.get("shortdef", [None])[0]

    # Extract first example sentence (if available)
    example = None
    try:
        defs = entry.get("def", [])
        if defs:
            sseq = defs[0].get("sseq", [])
            if sseq and len(sseq[0]) > 0:
                dt_list = sseq[0][0][1].get("dt", [])
                # find the "vis" section that holds examples
                for item in dt_list:
                    if item[0] == "vis":  # example list
                        example = item[1][0]["t"]
                        break
    except Exception as e:
        print("Error extracting example:", e)
    
    if example:
        example = re.sub(r"\{[^}]+\}", "", example)

    # Save the word to DB
    try:
        new_word = Word(word=word, meaning=meaning, example=example, user_id=user_id)
        db.add(new_word)
        db.commit()
        db.refresh(new_word)
    except Exception as e:
        import traceback
        print("DB Error:", e)
        traceback.print_exc()
        return {"error": "Failed to save word to database"}

    return {"word": new_word.word, "meaning": new_word.meaning, "example": new_word.example, "source": "api", "date_added": new_word.date_added.isoformat()}

@router.get("/get_words/{user_id}")
def get_words(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user_words = db.query(Word).filter(Word.user_id == user_id).all()
    return [
        {
            "id": w.id,
            "word": w.word,
            "meaning": w.meaning,
            "example": w.example,
            "date_added": w.date_added.isoformat()
        }
        for w in user_words
    ]
    