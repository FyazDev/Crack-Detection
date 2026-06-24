import os
import cv2
import numpy as np
import base64
from skimage import morphology

def process_image_for_model(image_bytes: bytes):
    """
    Convert raw bytes to an OpenCV image and preprocess it for the model.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Store original dimensions for later
    orig_shape = img_rgb.shape[:2]
    
    # Resize to standard size for model if necessary, e.g., 512x512
    # This might need to change based on actual model architecture
    target_size = (512, 512)
    img_resized = cv2.resize(img_rgb, target_size)
    
    # Normalize
    img_normalized = img_resized.astype(np.float32) / 255.0
    
    return img, orig_shape, img_normalized

def generate_result_image(orig_image, mask, mask_color=(0, 255, 0), alpha=0.5):
    """
    Overlay the segmentation mask on the original image.
    """
    # Ensure mask is same size as original image
    mask_resized = cv2.resize(mask.astype(np.uint8), (orig_image.shape[1], orig_image.shape[0]), interpolation=cv2.INTER_NEAREST)
    
    # Create colored mask
    colored_mask = np.zeros_like(orig_image)
    colored_mask[mask_resized == 1] = mask_color
    
    # Overlay
    result_img = cv2.addWeighted(orig_image, 1.0, colored_mask, alpha, 0)
    
    # Encode to base64 to send to frontend
    _, buffer = cv2.imencode('.jpg', result_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return img_base64

def calculate_crack_length(mask, pixels_per_metric=None):
    """
    Calculate the length of the crack using skeletonization.
    """
    # Skeletonize the binary mask
    skeleton = morphology.skeletonize(mask)
    
    # Count the number of white pixels in the skeleton
    pixel_length = np.sum(skeleton)
    
    if pixels_per_metric is not None and pixels_per_metric > 0:
        actual_length = pixel_length / pixels_per_metric
        return {
            "length": round(float(actual_length), 2),
            "unit": "metric_units",
            "pixel_length": int(pixel_length)
        }
    else:
        return {
            "length": int(pixel_length),
            "unit": "pixels",
            "pixel_length": int(pixel_length)
        }
