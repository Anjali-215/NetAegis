from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    mongodb_url: str = "mongodb+srv://arunmp192000:r6qtemeqlF6YDNvw@netaegis.p12sfv3.mongodb.net/"
    database_name: str = "netaegis"
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings() 