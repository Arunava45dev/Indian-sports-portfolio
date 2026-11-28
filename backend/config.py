"""Environment-backed application settings."""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB = os.getenv("MONGODB_DB", "sports_portfolio")
    ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
