from fastapi import FastAPI, Form, UploadFile, File
from fastapi.responses import JSONResponse
# ... existing code ...
import uuid

app = FastAPI()

# Allow the local Next.js frontend to call this API
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust if your frontend runs on a different origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/start")
async def start_analysis(
    context: str = Form(...)):
    print(f"Starting Analysis with context {context}")  # debug log to verify call
    # Receive multipart/form-data with key "file"
    #contents = await file.read()

    return JSONResponse({
        "jobId": str(uuid.uuid4()),
        "agents": [
            {"name": "Market Fit Agent", "status": "queued", "progress": 0},
            {"name": "Financials Agent", "status": "queued", "progress": 0},
            {"name": "Tech Diligence Agent", "status": "queued", "progress": 0},
        ]
    })

# ... existing code ...
# Minimal status endpoint so the frontend polling succeeds
from typing import List

@app.get("/status/{job_id}")
async def get_status(job_id: str) -> List[dict]:
    # Return a simple simulated progress
    return [
        {"name": "Market Fit Agent", "status": "running", "progress": 40},
        {"name": "Financials Agent", "status": "queued", "progress": 0},
        {"name": "Tech Diligence Agent", "status": "queued", "progress": 0},
    ]
# ... existing code ...
