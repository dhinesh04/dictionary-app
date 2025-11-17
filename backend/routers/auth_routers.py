from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import User
from schemas import UserCreate, UserLogin, UserResponse, GoogleLoginRequest, AuthResponse
from database import SessionLocal
from utils.auth_utils import create_access_token, verify_access_token
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

load_dotenv()

# Initialize Firebase Admin SDK
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
if FIREBASE_CREDENTIALS_PATH and not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User email not registered. Register first!")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return {"message":"Login successful", 
            "user_id": db_user.id,
            "token_type": "bearer",
            "user_id": db_user.id,
            "access_token": access_token
            }

@router.post("/google-login", response_model=AuthResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not FIREBASE_CREDENTIALS_PATH:
        raise HTTPException(status_code=500, detail="Firebase credentials not configured")

    # Verify Firebase ID token
    try:
        decoded_token = firebase_auth.verify_id_token(payload.id_token)
    except Exception as e:
        print("Firebase token verification error:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token")

    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name") or (email.split("@")[0] if email else None)

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Find or create user in Supabase-backed DB
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create a new user with no password (password is not used for Google accounts)
        user = User(
            username=name or email,
            email=email,
            hashed_password=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Issue your normal JWT
    access_token = create_access_token(data={"sub": str(user.id)})

    return AuthResponse(
        user_id=user.id,
        access_token=access_token,
        token_type="bearer",
    )