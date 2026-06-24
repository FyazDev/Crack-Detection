# Crack Detection

An AI-powered concrete crack detection and segmentation web application. 

This project uses a Deep Learning YOLO segmentation model (`crack_segmentation_v1.pt`) to analyze images of concrete structures, identify cracks, and estimate their length in pixels.

## Project Structure

- `frontend/`: Contains the static HTML, CSS, and JS files for the beautiful, dark-themed UI.
- `backend/`: A FastAPI Python server that runs the PyTorch model and processes the uploaded images.

## How to Run Locally

To run this application on your local machine, you need to start both the Python backend API and the frontend.

### 1. Start the Backend

1. Make sure you have Python installed (Python 3.8+ recommended).
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   pip install ultralytics  # Required for the YOLO model
   ```
4. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The backend will now be running at `http://localhost:8000`.

### 2. Start the Frontend

You can simply open `frontend/index.html` in your web browser, or use a local HTTP server for better performance:
```bash
cd frontend
python -m http.server 3000
```
Then navigate to `http://localhost:3000` in your web browser.

## Hosting and Deployment

This repository is configured to deploy both the frontend and backend using **Hugging Face Spaces**, but the frontend can also be hosted on **GitHub Pages** while communicating with the Hugging Face Space backend.

### 1. Syncing to Hugging Face Spaces (Backend & Frontend)

A GitHub action (`.github/workflows/deploy.yml`) is set up to automatically sync changes from the `main` branch to Hugging Face Spaces.

To enable this automatic deployment:
1. Go to your GitHub repository.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Name the secret **`HF_TOKEN`**.
5. Paste your Hugging Face write token (or generate a new one from Hugging Face settings under Access Tokens).
6. Click **Add secret**.

Once set up, every push to `main` will automatically deploy the application to your space at `https://huggingface.co/spaces/FyazNafin/crack-detection`. Since FastAPI mounts the frontend static files, the app is fully accessible directly at your space's direct URL:
👉 `https://fyaznafin-crack-detection.hf.space`

### 2. Hosting the Frontend on GitHub Pages (Optional)

If you wish to host the frontend separately on GitHub Pages:
1. Go to **Settings** > **Pages** in your GitHub repository.
2. Under **Build and deployment**, select **GitHub Actions** or choose the branch (`main` or a separate `gh-pages` branch) and folder (e.g., `/docs` if you move frontend there, or use a custom GitHub Actions workflow).
3. The frontend is pre-configured in `frontend/script.js` to dynamically connect:
   - When running on `localhost`, it connects to your local backend (`http://localhost:8000`).
   - When running on GitHub Pages (or any other domain), it automatically points requests to the live Hugging Face Space backend at `https://fyaznafin-crack-detection.hf.space`.
   - When loaded directly inside Hugging Face Spaces, it uses relative routing for maximum efficiency and security.
