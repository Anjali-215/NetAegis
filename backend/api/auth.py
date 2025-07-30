from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta
from database import get_database
from services.user_service import UserService
from models.user import UserCreate, UserLogin, Token, UserResponse
from utils.auth import create_access_token, verify_token
from config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    database: AsyncIOMotorDatabase = Depends(get_database)
) -> UserResponse:
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_service = UserService(database)
    user = await user_service.get_user_by_email(token_data.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Helper to check admin role
async def require_admin(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

@router.post("/register", response_model=UserResponse)
async def register(
    user: UserCreate,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        user_service = UserService(database)
        created_user = await user_service.create_user(user)
        
        # Return only user data, no token
        return created_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    user_service = UserService(database)
    user = await user_service.authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Convert UserInDB to UserResponse for response
    user_response = UserResponse(
        id=user.id,
        name=user.name,
        company=user.company,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        is_active=user.is_active
    )
    
    return Token(access_token=access_token, user=user_response)

@router.post("/admin/add_user", response_model=UserResponse)
async def admin_add_user(
    user: UserCreate = Body(...),
    database: AsyncIOMotorDatabase = Depends(get_database),
    admin_user: UserResponse = Depends(require_admin)
):
    # Force role to 'user' regardless of input
    user_data = user.model_copy(update={"role": "user"})
    try:
        user_service = UserService(database)
        created_user = await user_service.create_user(user_data)
        return created_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin/users", response_model=list[UserResponse])
async def admin_list_users(
    database: AsyncIOMotorDatabase = Depends(get_database),
    admin_user: UserResponse = Depends(require_admin)
):
    user_service = UserService(database)
    return await user_service.list_users()

@router.delete("/admin/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    database: AsyncIOMotorDatabase = Depends(get_database),
    admin_user: UserResponse = Depends(require_admin)
):
    user_service = UserService(database)
    
    # First check if the user exists and is not an admin
    user_to_delete = await user_service.get_user_by_id(user_id)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_delete.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    
    # Delete the user
    deleted = await user_service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    return current_user 