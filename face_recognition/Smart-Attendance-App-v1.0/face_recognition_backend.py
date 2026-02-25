import cv2
import numpy as np
import os
import pickle
from datetime import datetime
import logging

# Load Haar Cascade classifier for face detection
CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

# ---------------- Persistent Base Directory ----------------
BASE_DIR = os.path.join(os.getcwd(), "runtime_data")
IMAGES_DIR = os.path.join(BASE_DIR, "images")
ENCODINGS_FILE = os.path.join(BASE_DIR, "encodings.pkl")
LOG_DIR = os.path.join(BASE_DIR, "logs")

# Ensure directories exist
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# -------------------- Logging Setup --------------------
log_file = os.path.join(LOG_DIR, "face_recognition.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler(log_file, encoding='utf-8')]
)

# -------------------- Face Encoding Function --------------------
def extract_face_encoding(face_roi):
    """Extract a simple encoding from face region using histogram features"""
    try:
        # Resize to fixed size for consistency
        face_resized = cv2.resize(face_roi, (100, 100))
        
        # Convert to grayscale
        gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        
        # Extract histogram features
        hist = cv2.calcHist([gray], [0], None, [64], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        
        # Extract additional LBP-like features (simplified)
        # Calculate edges using Sobel
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        edge_hist = cv2.calcHist([sobelx.astype(np.uint8)], [0], None, [32], [0, 256])
        edge_hist = cv2.normalize(edge_hist, edge_hist).flatten()
        
        # Combine features
        encoding = np.concatenate([hist, edge_hist])
        return encoding
    except Exception as e:
        logging.error(f"Error extracting face encoding: {e}")
        return None

# -------------------- Face Detection Function --------------------
def detect_faces(frame):
    """Detect faces in frame using Haar Cascade"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return faces

# -------------------- Update Encodings --------------------
def update_encodings(images_dir=IMAGES_DIR, encodings_file=ENCODINGS_FILE):
    try:
        known_encodings = []
        names = []

        for user in os.listdir(images_dir):
            user_dir = os.path.join(images_dir, user)
            if not os.path.isdir(user_dir):
                continue
            for file_name in os.listdir(user_dir):
                img_path = os.path.join(user_dir, file_name)
                img = cv2.imread(img_path)
                if img is None:
                    logging.warning(f"Cannot read image: {img_path}")
                    continue
                
                # Detect faces and extract encodings
                faces = detect_faces(img)
                if len(faces) > 0:
                    x, y, w, h = faces[0]
                    face_roi = img[y:y+h, x:x+w]
                    encoding = extract_face_encoding(face_roi)
                    if encoding is not None:
                        known_encodings.append(encoding)
                        names.append(user)
                else:
                    logging.warning(f"No face found in image: {img_path}")

        with open(encodings_file, 'wb') as f:
            pickle.dump({"names": names, "encodings": known_encodings}, f)
        logging.info(f"Encodings updated: {len(names)} faces encoded.")

    except Exception as e:
        logging.error(f"Failed to update encodings: {e}")
        raise e

# -------------------- Recognize Faces in Single Frame --------------------
def recognize_faces_in_frame(frame, encodings_file=ENCODINGS_FILE, threshold=0.6):
    """Return list of recognized names in a single frame"""
    if not os.path.exists(encodings_file):
        logging.warning("Encodings file missing. Generating new encodings...")
        update_encodings()

    try:
        with open(encodings_file, 'rb') as f:
            data = pickle.load(f)
    except (EOFError, pickle.UnpicklingError):
        logging.warning("Encodings file corrupted. Regenerating...")
        update_encodings()
        with open(encodings_file, 'rb') as f:
            data = pickle.load(f)

    known_encodings = data.get("encodings", [])
    names = data.get("names", [])

    if not known_encodings:
        return []

    # Detect faces in frame
    faces = detect_faces(frame)
    recognized_names = []

    for (x, y, w, h) in faces:
        face_roi = frame[y:y+h, x:x+w]
        face_encoding = extract_face_encoding(face_roi)
        
        if face_encoding is None:
            continue

        # Compare with known encodings using normalized distance
        distances = []
        for known_encoding in known_encodings:
            # Calculate L2 distance between encodings
            distance = np.linalg.norm(known_encoding - face_encoding)
            distances.append(distance)

        if len(distances) > 0:
            best_match_index = np.argmin(distances)
            best_distance = distances[best_match_index]
            
            # Threshold for match (lower is better)
            if best_distance < threshold:
                name = names[best_match_index]
                if name not in recognized_names:
                    recognized_names.append(name)

    return recognized_names

# -------------------- Full Webcam Recognition (Optional) --------------------
def run_face_recognition(callback=None, threshold=0.6, encodings_file=ENCODINGS_FILE):
    if not os.path.exists(encodings_file):
        logging.warning("Encodings file not found, generating new encodings...")
        update_encodings()

    try:
        with open(encodings_file, 'rb') as f:
            data = pickle.load(f)
        known_encodings = data.get("encodings", [])
        names = data.get("names", [])
    except (EOFError, pickle.UnpicklingError):
        logging.warning("Encodings file corrupted. Regenerating...")
        update_encodings()
        with open(encodings_file, 'rb') as f:
            data = pickle.load(f)
        known_encodings = data.get("encodings", [])
        names = data.get("names", [])

    if not known_encodings:
        logging.warning("No known faces found in dataset. Exiting recognition.")
        return []

    attendance_list = []

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        logging.error("Cannot access webcam")
        return attendance_list

    logging.info("Webcam started for face recognition.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Detect faces in current frame
        faces = detect_faces(frame)

        for (x, y, w, h) in faces:
            face_roi = frame[y:y+h, x:x+w]
            face_encoding = extract_face_encoding(face_roi)
            
            if face_encoding is None:
                continue

            # Compare with known encodings
            distances = []
            for known_encoding in known_encodings:
                distance = np.linalg.norm(known_encoding - face_encoding)
                distances.append(distance)

            name = "Unknown"
            if len(distances) > 0:
                best_match_index = np.argmin(distances)
                if distances[best_match_index] < threshold:
                    name = names[best_match_index]

            if name != "Unknown" and name not in [x['name'] for x in attendance_list]:
                now = datetime.now().strftime('%H:%M:%S')
                attendance_list.append({'name': name, 'time': now})
                logging.info(f"Marked {name} at {now}")
                if callback:
                    try:
                        callback(name, now)
                    except Exception as e:
                        logging.warning(f"Callback error: {e}")

    cap.release()
    logging.info("Webcam closed.")
    return attendance_list
