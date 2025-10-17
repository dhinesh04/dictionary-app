from fastapi import APIRouter
import requests
from dotenv import load_dotenv
import os
import re


load_dotenv()

DICTIONARY_API_KEY = os.getenv("DICTIONARY_API_KEY")

router = APIRouter(prefix="/api", tags=["Dictionary"])

@router.get("/enter")
def enter_word(word: str):
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

    return {"word": word, "meaning": meaning, "example": example}
    