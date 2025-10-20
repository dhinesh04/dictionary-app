from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from database import engine, Base

from routes import dictionary, words

app = FastAPI(title = "Dictionary App")

Base.metadata.create_all(bind=engine)

# Allow your frontend to talk to backend
origins = [
    "http://localhost:5173",  # React dev server
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow these origins
    allow_credentials=True,
    allow_methods=["*"],    # allow GET, POST, etc.
    allow_headers=["*"],    # allow all headers
)

app.include_router(dictionary.router)
app.include_router(words.router)
app.include_router(auth.router, prefix="/api", tags=["auth"])

@app.get("/")
def home():
    return {"message": "Welcome to the Dictionary App!"}