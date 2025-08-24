from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta, datetime, timezone
from database import get_database
import secrets
import string

async def get_db():
    return await get_database()
from services.user_service import UserService
from models.user import UserCreate, UserLogin, Token, UserResponse, PasswordResetRequest, PasswordReset, PasswordResetToken, AdminUserCreate
from utils.auth import create_access_token, verify_token, verify_password
from utils.email_service import EmailService
from config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    database: AsyncIOMotorDatabase = Depends(get_db)
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

def generate_reset_token():
    """Generate a secure random token for password reset"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def ensure_utc_datetime(dt):
    """Ensure datetime is timezone-aware and in UTC"""
    if dt.tzinfo is None:
        # If naive datetime, assume UTC
        return dt.replace(tzinfo=timezone.utc)
    else:
        # If timezone-aware, convert to UTC
        return dt.astimezone(timezone.utc)

def parse_mongodb_datetime(expires_at_raw):
    """Parse datetime from MongoDB, handling various formats"""
    try:
        if isinstance(expires_at_raw, str):
            # Handle ISO format strings
            if expires_at_raw.endswith('Z'):
                # UTC time with Z suffix
                return datetime.fromisoformat(expires_at_raw.replace('Z', '+00:00'))
            elif '+' in expires_at_raw or expires_at_raw.endswith('UTC'):
                # Timezone-aware string
                return datetime.fromisoformat(expires_at_raw)
            else:
                # Assume UTC if no timezone info
                return datetime.fromisoformat(expires_at_raw + '+00:00')
        elif isinstance(expires_at_raw, datetime):
            # Already a datetime object
            if expires_at_raw.tzinfo is None:
                return expires_at_raw.replace(tzinfo=timezone.utc)
            else:
                return expires_at_raw.astimezone(timezone.utc)
        else:
            raise ValueError(f"Unknown datetime type: {type(expires_at_raw)}")
    except Exception as e:
        # Try alternative parsing methods
        if isinstance(expires_at_raw, str):
            try:
                from email.utils import parsedate_to_datetime
                dt = parsedate_to_datetime(expires_at_raw)
                if dt.tzinfo is None:
                    return dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            except Exception:
                pass
        raise ValueError(f"Failed to parse datetime: {expires_at_raw}, error: {e}")

@router.get("/direct-reset", response_class=HTMLResponse)
async def direct_reset_page(request: Request, database: AsyncIOMotorDatabase = Depends(get_db)):
    """Direct password reset page for development/testing"""
    token = request.query_params.get("token")
    
    if not token:
        return HTMLResponse(content="""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invalid Reset Link - NetAegis</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="error">
                <h1>❌ Invalid Reset Link</h1>
                <p>No token provided. Please request a new password reset.</p>
            </div>
        </body>
        </html>
        """)
    
    # Check if token exists and is valid
    reset_token_doc = await database.get_collection("password_reset_tokens").find_one({"token": token})
    
    if not reset_token_doc:
        return HTMLResponse(content="""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invalid Token - NetAegis</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="error">
                <h1>❌ Invalid Token</h1>
                <p>This reset token is invalid or has expired. Please request a new password reset.</p>
            </div>
        </body>
        </html>
        """)
    
    # Check if token is expired
    try:
        # Check if expires_at field exists
        if "expires_at" not in reset_token_doc:
            print(f"Missing expires_at field in token document")
            # Delete the corrupted token
            await database.get_collection("password_reset_tokens").delete_one({"token": token})
            return HTMLResponse(content="""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invalid Token - NetAegis</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ Invalid Token</h1>
                    <p>This reset token is invalid or corrupted. Please request a new password reset.</p>
                </div>
            </body>
            </html>
            """)
        
        expires_at_raw = reset_token_doc["expires_at"]
        
        # Use the robust datetime parsing function
        try:
            expires_at = parse_mongodb_datetime(expires_at_raw)
        except ValueError as parse_error:
            print(f"Failed to parse datetime: {parse_error}")
            # Delete the problematic token to prevent future errors
            await database.get_collection("password_reset_tokens").delete_one({"token": token})
            return HTMLResponse(content="""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invalid Token - NetAegis</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ Invalid Token</h1>
                    <p>This reset token is invalid or corrupted. Please request a new password reset.</p>
                </div>
            </body>
            </html>
            """)
        
        # Use timezone-aware comparison
        current_time = datetime.now(timezone.utc)
        if current_time > expires_at:
            # Delete expired token
            await database.get_collection("password_reset_tokens").delete_one({"token": token})
            return HTMLResponse(content="""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Expired Token - NetAegis</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>⏰ Expired Token</h1>
                    <p>This reset token has expired. Please request a new password reset.</p>
                </div>
            </body>
            </html>
            """)
    except Exception as e:
        print(f"Token expiration check error: {e}")
        print(f"Token data: {reset_token_doc}")
        # Delete the problematic token to prevent future errors
        try:
            await database.get_collection("password_reset_tokens").delete_one({"token": token})
            print(f"Deleted problematic token: {token}")
        except Exception:
            pass  # Don't fail if cleanup fails
        return HTMLResponse(content="""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invalid Token - NetAegis</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="error">
                <h1>❌ Invalid Token</h1>
                <p>This reset token is invalid or corrupted. Please request a new password reset.</p>
            </div>
        </body>
        </html>
        """)
    
    # Return the password reset form
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reset Password - NetAegis</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }}
            .container {{
                max-width: 500px;
                width: 90%;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }}
            .header {{
                background: linear-gradient(135deg, #b71c1c 0%, #7f0000 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }}
            .content {{
                padding: 30px;
            }}
            .form-group {{
                margin-bottom: 20px;
            }}
            .form-group label {{
                display: block;
                margin-bottom: 8px;
                font-weight: bold;
                color: #333;
            }}
            .form-group input {{
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 6px;
                font-size: 16px;
                box-sizing: border-box;
                transition: border-color 0.3s ease;
            }}
            .form-group input:focus {{
                outline: none;
                border-color: #b71c1c;
            }}
            .button {{
                width: 100%;
                background: linear-gradient(135deg, #b71c1c 0%, #7f0000 100%);
                color: white;
                padding: 14px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s ease;
            }}
            .button:hover {{
                transform: translateY(-2px);
            }}
            .button:disabled {{
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }}
            .message {{
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
                font-weight: bold;
            }}
            .success {{
                background-color: #e8f5e8;
                border: 1px solid #c3e6c3;
                color: #2e7d32;
            }}
            .error {{
                background-color: #ffebee;
                border: 1px solid #f44336;
                color: #d32f2f;
            }}
            .warning {{
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                font-size: 14px;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Password</h1>
                <p>NetAegis Security System</p>
            </div>
            <div class="content">
                <div class="warning">
                    <strong>⚠️ Development Mode:</strong> This is a direct database reset interface for development and testing purposes.
                </div>
                <form id="resetForm" method="POST">
                    <div class="form-group">
                        <label for="password">New Password:</label>
                        <input type="password" id="password" name="password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm New Password:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
                    </div>
                    <button type="submit" class="button" id="submitBtn">Reset Password</button>
                </form>
                <div id="message"></div>
            </div>
        </div>
        
        <script>
            document.getElementById('resetForm').addEventListener('submit', async function(e) {{
                e.preventDefault();
                
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const submitBtn = document.getElementById('submitBtn');
                const messageDiv = document.getElementById('message');
                
                // Validation
                if (password !== confirmPassword) {{
                    messageDiv.innerHTML = '<div class="message error">Passwords do not match!</div>';
                    return;
                }}
                
                if (password.length < 6) {{
                    messageDiv.innerHTML = '<div class="message error">Password must be at least 6 characters long!</div>';
                    return;
                }}
                
                // Disable button and show loading
                submitBtn.disabled = true;
                submitBtn.textContent = 'Resetting...';
                messageDiv.innerHTML = '';
                
                try {{
                    const response = await fetch('/auth/reset-password', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json',
                        }},
                        body: JSON.stringify({{
                            token: '{token}',
                            new_password: password
                        }})
                    }});
                    
                    const data = await response.json();
                    
                    if (response.ok) {{
                        messageDiv.innerHTML = '<div class="message success">✅ Password reset successful! You can now log in with your new password.</div>';
                        submitBtn.textContent = 'Password Reset Complete';
                        document.getElementById('resetForm').style.display = 'none';
                    }} else {{
                        messageDiv.innerHTML = '<div class="message error">❌ ' + (data.detail || 'Failed to reset password') + '</div>';
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Reset Password';
                    }}
                }} catch (error) {{
                    messageDiv.innerHTML = '<div class="message error">❌ Network error. Please try again.</div>';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Reset Password';
                }}
            }});
        </script>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

@router.post("/register", response_model=UserResponse)
async def register(
    user: UserCreate,
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Log the received user data for debugging
        print(f"Registration attempt - Received user data: {user}")
        
        user_service = UserService(database)
        # Force role to 'admin' for all new registrations
        user_data = user.model_copy(update={"role": "admin"})
        print(f"Registration attempt - Modified user data: {user_data}")
        
        created_user = await user_service.create_user(user_data)
        print(f"Registration successful - Created user: {created_user}")
        
        # Return only user data, no token
        return created_user
    except ValueError as e:
        print(f"Registration failed - ValueError: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Registration failed - Unexpected error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Basic email format validation
        if not user_credentials.email or '@' not in user_credentials.email:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Please enter a valid email address."
            )
        
        # Check if password is provided
        if not user_credentials.password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password is required."
            )
        
        user_service = UserService(database)
        user = await user_service.authenticate_user(user_credentials.email, user_credentials.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password. Please check your credentials and try again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active. Please check your email for activation instructions.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last login timestamp
        await user_service.update_last_login(user_credentials.email)
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again later."
        )

@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Send password reset email to user"""
    try:
        user_service = UserService(database)
        user = await user_service.get_user_by_email(request.email)
        
        if not user:
            # Don't reveal if user exists or not for security
            return {"message": "If an account with that email exists, a password reset link has been sent."}
        
        # Generate reset token
        reset_token = generate_reset_token()
        expires_at = ensure_utc_datetime(datetime.now(timezone.utc) + timedelta(hours=1))  # Token expires in 1 hour
        
        # Store reset token in database
        reset_token_data = PasswordResetToken(
            email=request.email,
            token=reset_token,
            expires_at=expires_at
        )
        
        # Ensure the datetime is properly formatted for MongoDB storage
        token_data = reset_token_data.model_dump()
        print(f"Storing token with expires_at: {token_data['expires_at']} (type: {type(token_data['expires_at'])})")
        
        # Save to password_reset_tokens collection
        await database.get_collection("password_reset_tokens").insert_one(token_data)
        
        # Send email with reset link
        email_service = EmailService()
        reset_link = f"http://localhost:5173/atlas-reset?token={reset_token}&email={request.email}"
        
        # Create direct MongoDB Atlas link for development/testing
        atlas_link = f"http://localhost:8000/direct-reset?token={reset_token}"
        
        await email_service.send_password_reset_email(
            user_email=request.email,
            user_name=user.name,
            reset_link=reset_link,
            atlas_link=atlas_link
        )
        
        return {"message": "If an account with that email exists, a password reset link has been sent."}
        
    except Exception as e:
        # Log the error but don't expose it to the user
        print(f"Password reset error: {str(e)}")
        return {"message": "If an account with that email exists, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    request: PasswordReset,
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reset password using token"""
    try:
        # Find the reset token
        reset_token_doc = await database.get_collection("password_reset_tokens").find_one({
            "token": request.token
        })
        
        if not reset_token_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Check if token is expired
        try:
            # Check if expires_at field exists
            if "expires_at" not in reset_token_doc:
                print(f"Missing expires_at field in token document")
                # Delete the corrupted token
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token format - missing expiration"
                )
            
            expires_at_raw = reset_token_doc["expires_at"]
            
            # Use the robust datetime parsing function
            try:
                expires_at = parse_mongodb_datetime(expires_at_raw)
                print(f"Successfully parsed datetime: {expires_at}")
            except ValueError as parse_error:
                print(f"Failed to parse datetime: {parse_error}")
                # Delete the problematic token to prevent future errors
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token format"
                )
            
            if datetime.now(timezone.utc) > expires_at:
                # Delete expired token
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Reset token has expired"
                )
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as expire_error:
            print(f"Token expiration check error: {expire_error}")
            print(f"Token data: {reset_token_doc}")
            # Delete the problematic token to prevent future errors
            try:
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                print(f"Deleted problematic token: {request.token}")
            except Exception:
                pass  # Don't fail if cleanup fails
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or corrupted reset token"
            )
        
        # Update user password
        user_service = UserService(database)
        success = await user_service.update_password(reset_token_doc["email"], request.new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update password"
            )
        
        # Delete the used token
        await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
        
        return {"message": "Password has been successfully reset"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting password"
        )

@router.post("/atlas-reset-password")
async def atlas_reset_password(
    request: PasswordReset,
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reset password via Atlas reset (called from frontend)"""
    try:
        print(f"Atlas reset password called with token: {request.token[:10]}...")
        print(f"New password length: {len(request.new_password)}")
        print(f"Database type: {type(database)}")
        
        # Add request ID for better logging
        import uuid
        request_id = str(uuid.uuid4())[:8]
        print(f"[{request_id}] Request ID for tracking")
        
        # Check if database is connected
        try:
            # Test database connection by trying to access a collection
            await database.get_collection("password_reset_tokens").find_one({})
            print(f"[{request_id}] Database connection is working")
        except Exception as db_error:
            print(f"[{request_id}] Database connection error: {db_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        # Find the reset token
        try:
            reset_token_doc = await database.get_collection("password_reset_tokens").find_one({
                "token": request.token
            })
            print(f"[{request_id}] Token search completed")
        except Exception as token_error:
            print(f"[{request_id}] Token search error: {token_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error searching for reset token"
            )
        
        if not reset_token_doc:
            print(f"[{request_id}] Token not found in database")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        print(f"[{request_id}] Token found for email: {reset_token_doc.get('email')}")
        print(f"[{request_id}] Token document keys: {list(reset_token_doc.keys())}")
        print(f"[{request_id}] Token document: {reset_token_doc}")
        
        # Check if token is expired
        try:
            # Check if expires_at field exists
            if "expires_at" not in reset_token_doc:
                print(f"[{request_id}] Missing expires_at field in token document")
                # Delete the corrupted token
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token format - missing expiration"
                )
            
            expires_at_raw = reset_token_doc["expires_at"]
            print(f"[{request_id}] Expires at raw value: {expires_at_raw}, type: {type(expires_at_raw)}")
            
            # Additional debugging for MongoDB ObjectId and other fields
            if "_id" in reset_token_doc:
                print(f"[{request_id}] Token _id: {reset_token_doc['_id']}")
            if "created_at" in reset_token_doc:
                print(f"[{request_id}] Token created_at: {reset_token_doc['created_at']}")
            
            # Handle different datetime formats
            if isinstance(expires_at_raw, str):
                # Handle ISO format strings
                try:
                    if expires_at_raw.endswith('Z'):
                        # UTC time with Z suffix
                        expires_at = datetime.fromisoformat(expires_at_raw.replace('Z', '+00:00'))
                    elif '+' in expires_at_raw or expires_at_raw.endswith('UTC'):
                        # Timezone-aware string
                        expires_at = datetime.fromisoformat(expires_at_raw)
                    else:
                        # Assume UTC if no timezone info
                        expires_at = datetime.fromisoformat(expires_at_raw + '+00:00')
                except ValueError as parse_error:
                    print(f"Failed to parse datetime string: {expires_at_raw}, error: {parse_error}")
                    # Try alternative parsing methods
                    try:
                        # Try parsing as RFC 3339 format
                        from email.utils import parsedate_to_datetime
                        expires_at = parsedate_to_datetime(expires_at_raw)
                    except Exception:
                        # If all parsing fails, assume token is invalid
                        await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid token format"
                        )
            elif isinstance(expires_at_raw, datetime):
                # Already a datetime object
                expires_at = expires_at_raw
                # Ensure it's timezone-aware
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
            else:
                # Unknown type, log and reject
                print(f"Unknown expires_at type: {type(expires_at_raw)}, value: {expires_at_raw}")
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token format"
                )
            
            current_time = datetime.now(timezone.utc)
            print(f"[{request_id}] Current time: {current_time}")
            print(f"[{request_id}] Expires at: {expires_at}")
            print(f"[{request_id}] Timezone info - Current: {current_time.tzinfo}, Expires: {expires_at.tzinfo}")
            
            if current_time > expires_at:
                # Delete expired token
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                print(f"[{request_id}] Token expired")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Reset token has expired"
                )
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as expire_error:
            print(f"Token expiration check error: {expire_error}")
            print(f"Token data: {reset_token_doc}")
            # Delete the problematic token to prevent future errors
            try:
                await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
                print(f"Deleted problematic token: {request.token}")
            except Exception:
                pass  # Don't fail if cleanup fails
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or corrupted reset token"
            )
        
        print(f"[{request_id}] Token is valid, updating password...")
        
        # Update user password
        try:
            user_service = UserService(database)
            success = await user_service.update_password(reset_token_doc["email"], request.new_password)
            
            if not success:
                print(f"[{request_id}] Failed to update password for email: {reset_token_doc['email']}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to update password"
                )
        except Exception as update_error:
            print(f"[{request_id}] Password update error: {update_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating password"
            )
        
        print(f"[{request_id}] Password updated successfully")
        
        # Delete the used token
        try:
            await database.get_collection("password_reset_tokens").delete_one({"token": request.token})
            print(f"[{request_id}] Token deleted successfully")
        except Exception as delete_error:
            print(f"[{request_id}] Token deletion error: {delete_error}")
            # Don't fail the request if token deletion fails
        
        return {"message": "Password has been successfully reset in MongoDB Atlas"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[{request_id}] Atlas password reset error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting password"
        )

@router.post("/admin/add_user", response_model=UserResponse)
async def admin_add_user(
    user: AdminUserCreate = Body(...),
    database: AsyncIOMotorDatabase = Depends(get_db),
    admin_user: UserResponse = Depends(require_admin)
):
    # Force role to 'user' and company to match admin's company
    user_data = user.model_copy(update={"role": "user", "company": admin_user.company})
    try:
        user_service = UserService(database)
        # Create user without password - backend will generate a temporary one
        created_user = await user_service.create_user_without_password(user_data)

        # Send a secure password setup link (one-time reset token) instead of emailing a plaintext password
        try:
            reset_token = generate_reset_token()
            expires_at = ensure_utc_datetime(datetime.now(timezone.utc) + timedelta(hours=1))

            reset_token_data = PasswordResetToken(
                email=created_user.email,
                token=reset_token,
                expires_at=expires_at
            )
            
            # Ensure the datetime is properly formatted for MongoDB storage
            token_data = reset_token_data.model_dump()
            print(f"Admin creating token with expires_at: {token_data['expires_at']} (type: {type(token_data['expires_at'])})")
            
            await database.get_collection("password_reset_tokens").insert_one(token_data)

            email_service = EmailService()
            reset_link = f"http://localhost:5173/atlas-reset?token={reset_token}&email={created_user.email}"
            atlas_link = f"http://localhost:8000/direct-reset?token={reset_token}"
            await email_service.send_welcome_email(
                user_email=created_user.email,
                user_name=created_user.name,
                company_name=created_user.company,
                admin_name=admin_user.name,
                setup_link=reset_link,
                atlas_link=atlas_link
            )
        except Exception as e:
            # Don't fail the user creation if email fails
            print(f"Failed to send welcome email: {e}")

        return created_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin/users", response_model=list[UserResponse])
async def admin_list_users(
    database: AsyncIOMotorDatabase = Depends(get_db),
    admin_user: UserResponse = Depends(require_admin)
):
    user_service = UserService(database)
    return await user_service.list_users(company=admin_user.company, exclude_user_id=str(admin_user.id))

@router.delete("/admin/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    database: AsyncIOMotorDatabase = Depends(get_db),
    admin_user: UserResponse = Depends(require_admin)
):
    user_service = UserService(database)
    
    # First check if the user exists and is not an admin
    user_to_delete = await user_service.get_user_by_id(user_id)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is from the same company
    if user_to_delete.company != admin_user.company:
        raise HTTPException(status_code=403, detail="Cannot delete users from different company")
    
    if (user_to_delete.role == "admin"):
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    
    # Delete the user
    deleted = await user_service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: str,
    update_data: dict = Body(...),
    database: AsyncIOMotorDatabase = Depends(get_db),
    admin_user: UserResponse = Depends(require_admin)
):
    user_service = UserService(database)
    
    # Check if user exists
    existing_user = await user_service.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is from the same company
    if existing_user.company != admin_user.company:
        raise HTTPException(status_code=403, detail="Cannot update users from different company")
    
    # Prevent updating admin users to non-admin roles (optional security measure)
    if existing_user.role == "admin" and "role" in update_data and update_data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Cannot change admin role")
    
    try:
        updated_user = await user_service.update_user(user_id, update_data)
        if not updated_user:
            raise HTTPException(status_code=400, detail="Failed to update user")
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    return current_user 

@router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_user_password(
    user_id: str,
    database: AsyncIOMotorDatabase = Depends(get_db),
    admin_user: UserResponse = Depends(require_admin)
):
    """Admin endpoint to trigger password reset for any user"""
    try:
        user_service = UserService(database)
        
        # Get user by ID
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user is from the same company
        if user.company != admin_user.company:
            raise HTTPException(status_code=403, detail="Cannot reset password for users from different company")
        
        # Generate reset token
        reset_token = generate_reset_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)  # Token expires in 1 hour
        
        # Store reset token in database
        reset_token_data = PasswordResetToken(
            email=user.email,
            token=reset_token,
            expires_at=expires_at
        )
        
        # Save to password_reset_tokens collection
        await database.get_collection("password_reset_tokens").insert_one(reset_token_data.model_dump())
        
        # Send email with reset link
        email_service = EmailService()
        reset_link = f"http://localhost:5173/atlas-reset?token={reset_token}&email={user.email}"
        
        # Create direct MongoDB Atlas link for development/testing
        atlas_link = f"http://localhost:8000/direct-reset?token={reset_token}"
        
        await email_service.send_password_reset_email(
            user_email=user.email,
            user_name=user.name,
            reset_link=reset_link,
            atlas_link=atlas_link
        )
        
        return {"message": f"Password reset email sent to {user.email}"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Admin password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email"
        ) 

@router.post("/change-password")
async def change_password(
    request: dict = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Change password for authenticated user"""
    try:
        current_password = request.get("current_password")
        new_password = request.get("new_password")
        
        if not current_password or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password and new password are required"
            )
        
        if len(new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters long"
            )
        
        # Verify current password
        user_service = UserService(database)
        user = await user_service.get_user_by_email(current_user.email)
        
        if not user or not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        success = await user_service.update_password(current_user.email, new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Change password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while changing password"
        )

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(
    request: dict = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update current user's profile"""
    try:
        name = request.get("name")
        role = request.get("role")
        
        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name is required"
            )
        
        # Update user profile
        user_service = UserService(database)
        success = await user_service.update_user_profile(current_user.email, name, role)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )
        
        # Get updated user data
        updated_user = await user_service.get_user_by_email(current_user.email)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve updated user data"
            )
        
        # Convert to UserResponse
        return UserResponse(
            id=str(updated_user.id),
            name=updated_user.name,
            email=updated_user.email,
            company=updated_user.company,
            role=updated_user.role,
            created_at=updated_user.created_at,
            is_active=updated_user.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update profile error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating profile"
        )

@router.put("/update-notification-preferences")
async def update_notification_preferences(
    request: dict = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update current user's notification preferences"""
    try:
        emailNotifications = request.get("emailNotifications", True)
        pushNotifications = request.get("pushNotifications", True)
        reportAlerts = request.get("reportAlerts", False)
        
        # Update notification preferences
        user_service = UserService(database)
        success = await user_service.update_notification_preferences(
            current_user.email, 
            emailNotifications, 
            pushNotifications, 
            reportAlerts
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update notification preferences"
            )
        
        return {"message": "Notification preferences updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update notification preferences error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating notification preferences"
        ) 
