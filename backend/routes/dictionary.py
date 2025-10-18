from fastapi import APIRouter, Depends
import requests
from dotenv import load_dotenv
import os
import re
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Word


load_dotenv()

DICTIONARY_API_KEY = os.getenv("DICTIONARY_API_KEY")

router = APIRouter(prefix="/api", tags=["Dictionary"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/enter")
def enter_word(word: str, db: Session = Depends(get_db)):
    # Check if word already exists in DB
    db_word = db.query(Word).filter(Word.word.ilike(word)).first()
    if db_word:
        return {
            "word": db_word.word,
            "meaning": db_word.meaning,
            "example": db_word.example,
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
        db_word = Word(word=word, meaning=meaning, example=example)
        db.add(db_word)
        db.commit()
        db.refresh(db_word)
    except Exception as e:
        import traceback
        print("DB Error:", e)
        traceback.print_exc()
        return {"error": "Failed to save word to database"}

    return {"word": word, "meaning": meaning, "example": example, "source": "api"}
    