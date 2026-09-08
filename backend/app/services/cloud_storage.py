"""Cloud Storage Service
Client: Ministry of Social Justice and Empowerment (MoSJE)
Provides unified interface for storing media assets:
- Local filesystem (Default / Development)
- AWS S3 / Cloudflare R2
- Google Cloud Storage (GCS)
- Supabase Storage

Guarantees zero-fail execution: falls back to local storage if cloud credentials are absent or fail.
"""

import os
import io
import time
import logging
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image

from ..config import settings

logger = logging.getLogger("ShilpSetu.CloudStorage")

def save_media_file(
    file_bytes: bytes,
    filename: str,
    content_type: str = "image/jpeg"
) -> Tuple[str, str]:
    """
    Saves media bytes to configured storage (Cloud or local).
    Returns (url, local_or_cloud_path).
    """
    provider = settings.CLOUD_STORAGE_PROVIDER.lower()

    # 1. AWS S3 / Cloudflare R2 upload
    if provider in ("s3", "r2") and settings.CLOUD_STORAGE_BUCKET:
        try:
            import boto3
            s3 = boto3.client("s3", region_name=settings.CLOUD_STORAGE_REGION)
            s3.put_object(
                Bucket=settings.CLOUD_STORAGE_BUCKET,
                Key=filename,
                Body=file_bytes,
                ContentType=content_type
            )
            public_url = (
                f"{settings.CLOUD_STORAGE_PUBLIC_URL}/{filename}"
                if settings.CLOUD_STORAGE_PUBLIC_URL
                else f"https://{settings.CLOUD_STORAGE_BUCKET}.s3.{settings.CLOUD_STORAGE_REGION}.amazonaws.com/{filename}"
            )
            logger.info(f"Uploaded {filename} to S3 bucket {settings.CLOUD_STORAGE_BUCKET}")
            return public_url, f"s3://{settings.CLOUD_STORAGE_BUCKET}/{filename}"
        except Exception as e:
            logger.warning(f"S3 upload failed ({e}). Falling back to local storage.")

    # 2. Google Cloud Storage (GCS) upload
    elif provider == "gcs" and settings.CLOUD_STORAGE_BUCKET:
        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(settings.CLOUD_STORAGE_BUCKET)
            blob = bucket.blob(filename)
            blob.upload_from_string(file_bytes, content_type=content_type)
            public_url = (
                f"{settings.CLOUD_STORAGE_PUBLIC_URL}/{filename}"
                if settings.CLOUD_STORAGE_PUBLIC_URL
                else f"https://storage.googleapis.com/{settings.CLOUD_STORAGE_BUCKET}/{filename}"
            )
            logger.info(f"Uploaded {filename} to GCS bucket {settings.CLOUD_STORAGE_BUCKET}")
            return public_url, f"gs://{settings.CLOUD_STORAGE_BUCKET}/{filename}"
        except Exception as e:
            logger.warning(f"GCS upload failed ({e}). Falling back to local storage.")

    # 3. Supabase Storage upload
    elif provider == "supabase" and settings.CLOUD_STORAGE_BUCKET:
        try:
            supabase_url = os.getenv("SUPABASE_URL", "")
            supabase_key = os.getenv("SUPABASE_KEY", "")
            if supabase_url and supabase_key:
                import requests
                upload_endpoint = f"{supabase_url}/storage/v1/object/{settings.CLOUD_STORAGE_BUCKET}/{filename}"
                headers = {
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": content_type
                }
                res = requests.post(upload_endpoint, data=file_bytes, headers=headers, timeout=5)
                if res.status_code in (200, 201):
                    public_url = f"{supabase_url}/storage/v1/object/public/{settings.CLOUD_STORAGE_BUCKET}/{filename}"
                    return public_url, public_url
        except Exception as e:
            logger.warning(f"Supabase storage upload failed ({e}). Falling back to local storage.")

    # 4. Zero-Fail Local Storage Fallback
    local_path = settings.UPLOAD_DIR / filename
    with open(local_path, "wb") as f:
        f.write(file_bytes)
    
    local_url = f"/static/uploads/{filename}"
    return local_url, str(local_path)
