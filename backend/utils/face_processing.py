# utils/face_processing.py

import torch
from facenet_pytorch import MTCNN, InceptionResnetV1

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Utilisez UNE seule instance avec les paramètres GPU/CPU
mtcnn = MTCNN(
    image_size=160,
    margin=20,
    keep_all=False,
    device=device  # Utilise le device (cuda/cpu) détecté
)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
from facenet_pytorch import MTCNN


def detect_face(image):
    boxes, _ = mtcnn.detect(image)
    if boxes is not None and len(boxes) > 0:
        x1, y1, x2, y2 = boxes[0]
        x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
        aligned_face = mtcnn(image)
        return aligned_face, (x1, y1, x2 - x1, y2 - y1)
    return None, None



def get_embedding(face_tensor):
    """
    Generate embedding vector for a given face tensor.
    """
    with torch.no_grad():
        embedding = resnet(face_tensor.unsqueeze(0).to(device))
    return embedding.cpu().numpy()
