from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_routers, dictionary_routers
from database import engine, Base

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

app.include_router(dictionary_routers.router, tags=["dictionary"])
app.include_router(auth_routers.router, tags=["auth"])

@app.get("/")
def home():
    return {"message": "Welcome to the Dictionary App!"}