### 🔍 Live Demo: AI-Powered Concrete Crack Detection & Segmentation

I am excited to share **Crack Detection**, an end-to-end AI application designed to automate structural health monitoring. By leveraging deep learning, this tool helps engineers and inspectors instantly identify defects, visualize crack paths, and estimate structural damage.

👉 **Try the Live Application:** [Hugging Face Space](https://huggingface.co/spaces/FyazNafin/crack-detection)
*⚡ Note: Because it is running on a free cloud container, it may take a few moments to wake up if it has been idle.*

#### ✨ Key Features

* **YOLOv8 Segmentation:** Utilizes a custom-trained Deep Learning model (`crack_segmentation_v1.pt`) to precisely map out irregular crack paths.
* **Pixel-Length Estimation:** Goes beyond basic detection by calculating and estimating the overall length of the crack in pixels.
* **Modern Web UI:** Features a fully responsive, dark-themed interface built for seamless image uploads and instant visual feedback.
* **Decoupled Architecture:** Built with a high-performance **FastAPI** backend and an optimized frontend capable of relative and dynamic API routing.

#### 🛠️ How to Test It Yourself

1. Click the **[Live Space Link](https://huggingface.co/spaces/FyazNafin/crack-detection)**.
2. Upload any image of a concrete surface, wall, or pavement.
3. The AI will instantly return a segmented overlay highlighting the crack alongside its estimated structural metrics.

