import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "app" / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
AUDIO_DIR = STATIC_DIR / "audio"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    APP_NAME: str = "ShilpSetu AI - Virtual Business Manager"
    APP_VERSION: str = "1.0.0"
    CLIENT_MINISTRY: str = "Ministry of Social Justice and Empowerment (MoSJE)"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # AI API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
    BHASHINI_USER_ID: str = os.getenv("BHASHINI_USER_ID", "")
    BHASHINI_PIPELINE_ID: str = os.getenv("BHASHINI_PIPELINE_ID", "")

    # MoSJE Fair Wage & Pricing Parameters
    STATUTORY_FAIR_WAGE_PER_HOUR: float = 120.0  # Statutory skilled artisan wage floor (INR/hour)
    WORKSHOP_OVERHEAD_RATE: float = 0.10          # 10% overhead for electricity, tools, studio space
    GEM_PROCUREMENT_MARGIN: float = 0.15          # 15% statutory public sector procurement markup

    # Craft multipliers (B2C)
    CRAFT_MULTIPLIERS: dict[str, float] = {
        "Terracotta & Pottery": 1.25,
        "Handloom Textiles": 1.45,
        "Dhokra & Metalware": 1.50,
        "Folk Painting": 1.40,
        "Woodcarving": 1.35,
        "Zari & Embroidery": 1.45,
        "Cane & Bamboo": 1.30,
        "General Handicraft": 1.35,
    }

    # Paths
    BASE_DIR: Path = BASE_DIR
    STATIC_DIR: Path = STATIC_DIR
    UPLOAD_DIR: Path = UPLOAD_DIR
    AUDIO_DIR: Path = AUDIO_DIR

    # Cloud & n8n Integration Settings
    N8N_ENABLED: bool = os.getenv("N8N_ENABLED", "true").lower() in ("true", "1", "yes")
    N8N_BASE_URL: str = os.getenv("N8N_BASE_URL", "http://localhost:5678")
    N8N_WEBHOOK_BARGAIN_GUARD: str = os.getenv("N8N_WEBHOOK_BARGAIN_GUARD", "http://localhost:5678/webhook/bargain-guard")
    N8N_WEBHOOK_ONDC_PUBLISH: str = os.getenv("N8N_WEBHOOK_ONDC_PUBLISH", "http://localhost:5678/webhook/ondc-publish")
    N8N_WEBHOOK_REEL_DISPATCH: str = os.getenv("N8N_WEBHOOK_REEL_DISPATCH", "http://localhost:5678/webhook/reel-dispatch")
    N8N_WEBHOOK_MINISTRY_ANALYTICS: str = os.getenv("N8N_WEBHOOK_MINISTRY_ANALYTICS", "http://localhost:5678/webhook/ministry-analytics")

    # Cloud Storage (Options: 'local', 's3', 'gcs', 'supabase')
    CLOUD_STORAGE_PROVIDER: str = os.getenv("CLOUD_STORAGE_PROVIDER", "local")
    CLOUD_STORAGE_BUCKET: str = os.getenv("CLOUD_STORAGE_BUCKET", "shilpsetu-media")
    CLOUD_STORAGE_REGION: str = os.getenv("CLOUD_STORAGE_REGION", "ap-south-1")
    CLOUD_STORAGE_PUBLIC_URL: str = os.getenv("CLOUD_STORAGE_PUBLIC_URL", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
