# face_verify_server.py  (v3 — LBPH-based face recognition)
# Run: .venv\Scripts\python.exe face_verify_server.py
# Listens on http://127.0.0.1:5001

import os, sys, base64, logging, shutil, json
from datetime import datetime
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(BASE_DIR, "runtime_data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")
MODEL_FILE = os.path.join(DATA_DIR, "lbph_model.yml")
LABELS_FILE = os.path.join(DATA_DIR, "labels.json")

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}

# ── Face detection helper ─────────────────────────────────────────────────────

FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_largest_face(gray_img):
    """Try multiple params, return largest face ROI coords or None."""
    eq = cv2.equalizeHist(gray_img)
    for scale in [1.05, 1.1, 1.2, 1.3]:
        for neighbors in [3, 4, 5]:
            faces = FACE_CASCADE.detectMultiScale(eq, scaleFactor=scale,
                                                  minNeighbors=neighbors, minSize=(30, 30))
            if len(faces) > 0:
                # pick the largest face
                return sorted(faces, key=lambda r: r[2]*r[3], reverse=True)[0]
    return None

def preprocess_face(frame, rect):
    """Crop + grayscale + resize + equalize a face ROI for LBPH."""
    x, y, w, h = rect
    roi = frame[y:y+h, x:x+w]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY) if len(roi.shape) == 3 else roi
    gray = cv2.equalizeHist(cv2.resize(gray, (200, 200)))
    return gray

# ── LBPH model management ─────────────────────────────────────────────────────

def load_labels():
    if os.path.exists(LABELS_FILE):
        try:
            with open(LABELS_FILE) as f:
                return json.load(f)     # {label_int_str: name}
        except Exception:
            pass
    return {}

def save_labels(labels_map):
    with open(LABELS_FILE, 'w') as f:
        json.dump(labels_map, f, indent=2)

def name_to_label(labels_map, name):
    # return existing label or allocate new one
    for k, v in labels_map.items():
        if v.lower() == name.lower():
            return int(k), labels_map
    new_label = max((int(k) for k in labels_map), default=-1) + 1
    labels_map[str(new_label)] = name
    return new_label, labels_map

def train_model():
    """Scan IMAGES_DIR, train LBPH on all detected faces, save model."""
    labels_map = {}
    faces_data = []
    labels_data = []

    for person_name in sorted(os.listdir(IMAGES_DIR)):
        person_dir = os.path.join(IMAGES_DIR, person_name)
        if not os.path.isdir(person_dir):
            continue

        label, labels_map = name_to_label(labels_map, person_name)

        for fname in os.listdir(person_dir):
            ext = os.path.splitext(fname)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue
            img_path = os.path.join(person_dir, fname)
            img = cv2.imread(img_path)
            if img is None:
                continue
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # try to find a face; if not found, use full image crop center
            rect = detect_largest_face(gray if len(gray.shape)==2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
            if rect is not None:
                face = preprocess_face(img, rect)
            else:
                # no face detected — use centre-crop of the image anyway
                h, w = gray.shape
                m = min(h, w)
                y0, x0 = (h-m)//2, (w-m)//2
                face = cv2.equalizeHist(cv2.resize(gray[y0:y0+m, x0:x0+w], (200, 200)))

            faces_data.append(face)
            labels_data.append(label)
            log.info(f"  trained: {person_name} / {fname}")

    if not faces_data:
        log.warning("No training data found. Upload photos via admin panel.")
        return False, labels_map

    recognizer = cv2.face.LBPHFaceRecognizer_create(radius=2, neighbors=8, grid_x=8, grid_y=8)
    recognizer.train(faces_data, np.array(labels_data))
    recognizer.save(MODEL_FILE)
    save_labels(labels_map)
    log.info(f"✅ Model trained: {len(faces_data)} face(s) across {len(labels_map)} person(s)")
    return True, labels_map

def load_model():
    if not os.path.exists(MODEL_FILE):
        ok, _ = train_model()
        if not ok:
            return None, {}
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_FILE)
    return recognizer, load_labels()

# ── Helpers ───────────────────────────────────────────────────────────────────

def decode_b64_image(b64: str):
    if ',' in b64:
        b64 = b64.split(',', 1)[1]
    arr = np.frombuffer(base64.b64decode(b64), np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

# LBPH confidence threshold — lower value = stricter match.
# Values below 80 are usually good; 0 = perfect match.
LBPH_THRESHOLD = 80.0

def verify_face(frame, target_name: str):
    recognizer, labels_map = load_model()
    if recognizer is None:
        return False, 0.0, 'no_dataset'

    # Reverse map: label_int → name
    label_to_name = {int(k): v for k, v in labels_map.items()}

    # Find face in webcam frame
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rect = detect_largest_face(gray)
    if rect is None:
        return False, 0.0, 'no_face'

    face = preprocess_face(frame, rect)
    label, confidence = recognizer.predict(face)

    predicted_name = label_to_name.get(label, 'unknown')
    # confidence: lower = better match; 0 = identical
    match_score = max(0.0, round(1.0 - confidence / 100.0, 4))

    log.info(f"predict: label={label} name={predicted_name!r} confidence={confidence:.2f} target={target_name!r}")

    matched = (confidence <= LBPH_THRESHOLD and predicted_name.lower() == target_name.lower())
    return matched, match_score, predicted_name

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/health')
def health():
    _, labels_map = load_model()
    return jsonify({'status': 'ok', 'service': 'face-verify-server-v3-lbph',
                    'enrolled': len(labels_map)})

@app.route('/verify', methods=['POST'])
def verify():
    body = request.get_json(force=True, silent=True) or {}
    name    = (body.get('name') or '').strip()
    img_b64 = body.get('image_b64') or ''

    if not name:    return jsonify({'error': 'name is required'}), 400
    if not img_b64: return jsonify({'error': 'image_b64 is required'}), 400

    frame = decode_b64_image(img_b64)
    if frame is None:
        return jsonify({'error': 'Could not decode image'}), 400

    matched, score, best_match = verify_face(frame, name)

    msgs = {
        'no_dataset': 'No face data in dataset. Ask admin to add your photo first.',
        'no_face':    'No face detected in your selfie. Ensure good lighting, remove glasses if needed, and face the camera directly.',
    }
    if best_match in msgs:
        return jsonify({'matched': False, 'confidence': 0.0, 'best_match': None,
                        'message': msgs[best_match]})

    return jsonify({
        'matched':    matched,
        'confidence': score,
        'best_match': best_match,
        'message':    'Identity verified successfully!' if matched
                      else f'Face did not match. Detected "{best_match}" but expected "{name}". Please try again.',
    })

@app.route('/known-names')
def known_names():
    names = []
    if os.path.isdir(IMAGES_DIR):
        names = sorted([d for d in os.listdir(IMAGES_DIR)
                        if os.path.isdir(os.path.join(IMAGES_DIR, d))])
    return jsonify({'names': names})

# ── Dataset management ────────────────────────────────────────────────────────

@app.route('/dataset/add', methods=['POST'])
def dataset_add():
    name     = (request.form.get('name') or '').strip()
    img_file = request.files.get('image')

    if not name:
        return jsonify({'error': 'name is required'}), 400
    if not img_file or img_file.filename == '':
        return jsonify({'error': 'image file is required'}), 400

    ext = os.path.splitext(secure_filename(img_file.filename))[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({'error': f'Unsupported file type: {ext}'}), 400

    img_bytes = img_file.read()
    np_arr = np.frombuffer(img_bytes, np.uint8)
    frame  = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({'error': 'Cannot read image. Please upload a valid JPG/PNG.'}), 400

    # Save image
    user_dir  = os.path.join(IMAGES_DIR, name)
    os.makedirs(user_dir, exist_ok=True)
    ts        = datetime.now().strftime('%Y%m%d_%H%M%S')
    save_path = os.path.join(user_dir, f'{ts}{ext}')
    with open(save_path, 'wb') as f:
        f.write(img_bytes)

    # Re-train LBPH model with new image
    ok, labels_map = train_model()
    if not ok:
        return jsonify({'error': 'Photo saved but training failed — no faces detected in any image.'}), 500

    count = len([f for f in os.listdir(user_dir)
                 if os.path.splitext(f)[1].lower() in ALLOWED_EXTENSIONS])
    return jsonify({'success': True,
                    'message': f'Photo added for "{name}" ({count} photo(s)). Model retrained ✅',
                    'name': name, 'photos': count})

@app.route('/dataset/list')
def dataset_list():
    result = []
    if os.path.isdir(IMAGES_DIR):
        for person in sorted(os.listdir(IMAGES_DIR)):
            person_dir = os.path.join(IMAGES_DIR, person)
            if os.path.isdir(person_dir):
                photos = [f for f in os.listdir(person_dir)
                          if os.path.splitext(f)[1].lower() in ALLOWED_EXTENSIONS]
                result.append({'name': person, 'photos': len(photos)})
    return jsonify({'dataset': result})

@app.route('/dataset/delete/<name>', methods=['DELETE'])
def dataset_delete(name):
    safe = secure_filename(name)
    person_dir = os.path.join(IMAGES_DIR, safe)
    if not os.path.isdir(person_dir):
        return jsonify({'error': f'"{safe}" not found in dataset'}), 404
    shutil.rmtree(person_dir)
    # Remove model so next call re-trains without deleted person
    if os.path.exists(MODEL_FILE):
        os.remove(MODEL_FILE)
    train_model()
    return jsonify({'success': True, 'message': f'"{safe}" removed and model retrained.'})

@app.route('/dataset/rebuild', methods=['POST'])
def dataset_rebuild():
    if os.path.exists(MODEL_FILE):
        os.remove(MODEL_FILE)
    ok, labels_map = train_model()
    return jsonify({'success': ok, 'enrolled': len(labels_map)})

if __name__ == '__main__':
    log.info('🚀  Face Verify Server v3 (LBPH)  →  http://127.0.0.1:5001')
    # Pre-train on startup if images exist
    if any(os.path.isdir(os.path.join(IMAGES_DIR, d)) for d in os.listdir(IMAGES_DIR)):
        log.info("Pre-training LBPH model on startup …")
        train_model()
    app.run(host='127.0.0.1', port=5001, debug=False)
