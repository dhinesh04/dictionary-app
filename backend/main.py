from fastapi import FastAPI
from routes import dictionary, words

app = FastAPI(title = "Dictionary App")

app.include_router(dictionary.router)
app.include_router(words.router)