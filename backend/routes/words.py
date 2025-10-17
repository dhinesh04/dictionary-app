from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Word
from database import SessionLocal

router = APIRouter(prefix="/api", tags=["Words"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/save_word")
def save_word(word: str, meaning: str, example: str, db: Session = Depends(get_db)):
    db_word = Word(word=word, meaning=meaning, example=example)
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return {"message": "New word saved!"}

@router.get("/get_words")
def get_words(db: Session = Depends(get_db)):
    words = db.query(Word).all()
    return words