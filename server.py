import base64
import io
from fastapi import FastAPI
from pydantic import BaseModel
from PIL import Image, ImageOps
import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Running on device: {device}")
dtype = torch.float16 if device == "cuda" else torch.float32

pipe = None

pipe = None

def load_model():
    global pipe
    if pipe is not None:
        return

    print(f"Running on device: {device}")
    print("Loading ControlNet model...")

    controlnet = ControlNetModel.from_pretrained(
        "lllyasviel/control_v11p_sd15_scribble",
        torch_dtype=dtype
    )

    pipe = StableDiffusionControlNetPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        controlnet=controlnet,
        torch_dtype=dtype,
        safety_checker=None
    ).to(device)

    # ✅ ALWAYS SAFE
    pipe.enable_attention_slicing()

    # ✅ CPU ONLY optimization
    if device == "cpu":
        pipe.enable_sequential_cpu_offload()

    print("Model ready")

class GenerateRequest(BaseModel):
    prompt: str
    image: str

@app.post("/generate")
def generate(req: GenerateRequest):
    load_model()

    # Decode image
    image_bytes = base64.b64decode(req.image.split(",")[1])
    sketch = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # ControlNet expects inverted sketch
    sketch = ImageOps.invert(sketch)
    sketch = sketch.resize((512, 512))

    steps = 15 if device == "cpu" else 30

    result = pipe(
        prompt=req.prompt,
        image=sketch,
        num_inference_steps=steps,
        guidance_scale=7.5
    ).images[0]


    buffer = io.BytesIO()
    result.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode()

    return {
        "image": f"data:image/png;base64,{encoded}"
    }
