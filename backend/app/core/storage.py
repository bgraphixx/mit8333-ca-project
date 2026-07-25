import logging
import uuid
import os
import boto3
from fastapi import UploadFile, HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

def get_s3_client():
    if not settings.CLOUDFLARE_R2_ACCOUNT_ID:
        return None

    return boto3.client(
        's3',
        endpoint_url=f"https://{settings.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        region_name="auto"
    )

async def upload_file_to_r2(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}.",
        )

    s3_client = get_s3_client()
    if not s3_client or not settings.CLOUDFLARE_R2_PUBLIC_URL:
        raise HTTPException(status_code=500, detail="Cloudflare R2 is not configured properly.")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_UPLOAD_BYTES // (1024 * 1024)}MB.",
        )

    try:
        file_extension = os.path.splitext(file.filename or "")[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        s3_client.put_object(
            Bucket=settings.CLOUDFLARE_R2_BUCKET_NAME,
            Key=unique_filename,
            Body=content,
            ContentType=file.content_type
        )

        return f"{settings.CLOUDFLARE_R2_PUBLIC_URL.rstrip('/')}/{unique_filename}"
    except Exception:
        logger.exception("Failed to upload evidence file to R2")
        raise HTTPException(status_code=500, detail="Failed to upload file. Please try again.")
