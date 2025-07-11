# utils/logger.py

from utils.database import log_access
from datetime import datetime, timezone

def log_access_attempt(user_id, status, similarity):
    print(f"[{datetime.now(timezone.utc)}] User: {user_id} Status: {status} Similarity: {similarity:.4f}")
    log_access(user_id, status, similarity)

