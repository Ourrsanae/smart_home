# config.py

MONGODB_URI = "mongodb://localhost:27017"
DB_NAME = "face_access_system"

# Face recognition parameters
FACE_DETECTOR_DEVICE = "cuda"  # or "cpu"
EMBEDDING_MODEL = "vggface2"
SIMILARITY_THRESHOLD = 0.65
