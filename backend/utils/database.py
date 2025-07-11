# utils/database.py

from pymongo import MongoClient
from config import MONGODB_URI, DB_NAME
from datetime import datetime, timezone

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

authorized_users_col = db["authorized_users"]
access_logs_col = db["access_logs"]

def insert_user(user_id: str, name: str, embedding: list):
    user_doc = {
        "_id": user_id,
        "name": name,
        "embedding": embedding
    }
    authorized_users_col.replace_one({"_id": user_id}, user_doc, upsert=True)

def get_all_users():
    return list(authorized_users_col.find({}, {"_id": 1, "name": 1, "embedding": 1}))

def log_access(user_id: str, status: str, similarity: float):
    access_logs_col.insert_one({
        "timestamp": datetime.now(timezone.utc),
        "user": user_id,
        "status": status,
        "similarity": similarity
    })
