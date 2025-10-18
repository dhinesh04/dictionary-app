from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True)
    meaning = Column(String)
    example = Column(String, nullable=True)
    date_added = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)