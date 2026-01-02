Below is a clean, professional **README.md** you can directly place in your repository.
It is written assuming your current setup (FastAPI + Uvicorn + Diffusers + ControlNet) and **handles the RTX 2050 / CPU fallback correctly**, including the issue you encountered with `enable_sequential_cpu_offload`.
# GANBrush – ControlNet Image Generation Web App

GANBrush is a web-based image generation application built using **FastAPI**, **Stable Diffusion + ControlNet**, and a **React-based UI**. It allows users to upload an input image (e.g., sketch/line art) and generate realistic images based on a text prompt.

## Tech Stack

* **Backend**: FastAPI, Uvicorn
* **ML Framework**: PyTorch, Diffusers, ControlNet
* **Frontend**: React
* **Model**: Stable Diffusion + ControlNet
* **Hardware**: NVIDIA RTX 2050 (GPU optional, CPU fallback supported)

## System Requirements

### Hardware

* NVIDIA GPU (RTX 2050 recommended)
* Minimum 8 GB RAM (16 GB recommended)

### Software

* Python **3.9 or 3.10**
* Git
* Node.js (for frontend)
* CUDA Toolkit (only if GPU acceleration is required)

## Step-by-Step Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Dhanashree03-c/GANBrush.git
cd GANBrush
```

### 2. Create & Activate Virtual Environment
# Windows (PowerShell):

```powershell
python -m venv venv
venv\Scripts\activate
```

# Linux / macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

If PyTorch is not installed properly, install it manually:

**GPU (RTX 2050):**

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

**CPU only:**

```bash
pip install torch torchvision torchaudio
```

### 5. Run the Backend Server

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:

```
http://localhost:8000
```

---

### 6. Run the Frontend (React)

```bash
cd frontend
npm install
npm start
npm run dev
```

Frontend will be available at:

```
http://localhost:3000
```

---

## API Endpoint

### Generate Image

**POST**

```
/generate
```

**Inputs:**

* Prompt (text)
* Control image (sketch/line art)

**Response:**

* Generated image (Base64 or file response)

## GPU / CPU Behavior

| Scenario                 | Behavior                      |
| ------------------------ | ----------------------------- |
| RTX 2050 + CUDA detected | Runs on GPU (fast)            |
| CUDA not detected        | Runs on CPU (slow but stable) |

CPU inference may take **3–5 minutes per image**, which is expected.

## Notes

* Safety checker is disabled for development use only.
* Do **not** expose the backend publicly without content moderation.
* Large models may take time to load during first request.
