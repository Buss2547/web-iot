from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> Any:
    """
    Register a new user / security operator.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An operator account with this email already exists.",
        )

    # Validate password length
    if len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    # Hash password & create user record
    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email.lower().strip(),
        full_name=user_in.full_name.strip(),
        hashed_password=hashed_pwd,
        role=user_in.role or "Operator",
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=Token)
def login(
    user_in: UserLogin,
    db: Session = Depends(get_db),
) -> Any:
    """
    Authenticate user with email and password (JSON request from frontend Axios).
    Returns JWT access token and user info.
    """
    email_clean = user_in.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account. Contact your administrator.",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login/access-token", response_model=Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Any:
    """
    OAuth2 compatible token login for Swagger UI (/docs).
    """
    email_clean = form_data.username.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account.",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current logged in operator profile.
    """
    return current_user
