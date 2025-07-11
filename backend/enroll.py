# enroll.py

import cv2
import uuid
from utils.face_processing import detect_face, get_embedding
from utils.database import insert_user
import numpy as np

def enroll_user():
    cap = cv2.VideoCapture(0)
    name = input("Enter user name: ").strip()
    print("[INFO] Position your face in front of the camera. Press 'c' to capture.")

    embeddings = []

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to capture frame")
            break

        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face = detect_face(img_rgb)

        cv2.imshow("Enrollment", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('c') and face is not None:
            embedding = get_embedding(face)
            embeddings.append(embedding.flatten())
            print("[INFO] Captured embedding")

        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    if embeddings:
        avg_embedding = np.mean(embeddings, axis=0).tolist()
        user_id = str(uuid.uuid4())
        insert_user(user_id, name, avg_embedding)
        print(f"[INFO] User '{name}' enrolled with ID: {user_id}")
    else:
        print("[WARN] No embeddings captured. Enrollment failed.")

if __name__ == "__main__":
    enroll_user()
