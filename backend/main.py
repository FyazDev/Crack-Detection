import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cv2
import numpy as np
import base64

try:
    from ultralytics import YOLO
    has_ultralytics = True
except ImportError:
    has_ultralytics = False

app = FastAPI(title="Crack Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "crack_segmentation_v1.pt")

# Load YOLO model
if has_ultralytics:
    try:
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print("Failed to load YOLO model:", e)
        model = None
else:
    model = None

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None, "has_ultralytics": has_ultralytics}

@app.post("/predict")
async def predict_crack(file: UploadFile = File(...)):
    if not model:
        return {"error": "Model failed to load. Ensure ultralytics is installed and the .pt file is valid."}
        
    try:
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run inference using Ultralytics YOLO
        results = model(img)
        
        # Plot the results exactly like the YOLO output format (bboxes, labels, masks)
        result_img = results[0].plot()
        
        # Extract mask information for accurate length calculation
        length = 0
        if results[0].masks is not None:
            from skimage import morphology
            # Combine all masks into a single binary mask (2D array)
            combined_mask = np.any(results[0].masks.data.cpu().numpy() > 0, axis=0)
            # Skeletonize the mask to get a 1-pixel wide centerline
            skeleton = morphology.skeletonize(combined_mask)
            # Count the pixels in the skeleton for a realistic length estimate
            length = int(np.sum(skeleton))
            
        # Convert to base64
        _, buffer = cv2.imencode('.jpg', result_img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        length_data = {
            "length": length,
            "unit": "pixels",
            "pixel_length": length
        }
        
        return {
            "success": True,
            "length": length_data,
            "result_image_b64": img_base64
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

# Mount static frontend files
FRONTEND_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(FRONTEND_PATH):
    app.mount("/", StaticFiles(directory=FRONTEND_PATH, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
