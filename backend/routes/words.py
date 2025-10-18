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

@router.get("/get_words")
def get_words(db: Session = Depends(get_db)):
    words = db.query(Word).all()
    return words