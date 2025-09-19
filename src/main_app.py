from fastapi import FastAPI, Form, UploadFile, File, Body
from fastapi.responses import JSONResponse, StreamingResponse
# ... existing code ...
import uuid
from dotenv import load_dotenv


app = FastAPI()
# Load base .env first
load_dotenv(".env")


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
    context: str = Form(...)  # <- text-only start
):
    print("Starting Analysis with context:", context[:80])  # debug log (truncated)
    # Here you would pass the 'context' into your analysis pipeline.
    folder = SUPABASE_FOLDER

    try:
        paths = list_all_files(SUPABASE_BUCKET, folder or "")
        if not paths:
            return JSONResponse({"detail": "No files found in the configured bucket/folder"}, status_code=404)

        # Download each file (bytes) and pass to your agents (hook point)
        file_blobs: TList[Dict[str, object]] = []
        for p in paths:
            try:
                blob = download_file_bytes(SUPABASE_BUCKET, p)
                file_blobs.append({"path": p, "bytes": blob})
            except Exception as e:
                return JSONResponse({"detail": f"Failed to download {p}: {e}"}, status_code=400)

        # TODO: Integrate with your agents. Example:
        # results = run_document_agents(file_blobs, context=context)
        for blob in file_blobs:
            print(f"Downloaded file: {blob['path']}")
    except Exception as e:
        print(f"Error during analysis: {e}")

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
# --- Supabase Storage integration (server-side) ---
import os
from typing import List as TList, Optional, Dict
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET")
SUPABASE_FOLDER = os.getenv("SUPABASE_FOLDER", "")  # optional subfolder

_supabase_client: Optional[Client] = None

def get_supabase() -> Client:
    """Create or return a cached Supabase client using service role key."""
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("Supabase env vars missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client

def list_all_files(bucket: str, folder: str = "") -> TList[str]:
    """List all file paths within a bucket/folder recursively."""
    sb = get_supabase()
    # Normalize path (no leading/trailing slashes)
    prefix = folder.strip("/")

    files: TList[str] = []
    queue: TList[str] = [prefix]  # directories to scan; '' means bucket root

    while queue:
        current = queue.pop(0)
        # Supabase Storage list method; directory is '' for root or 'sub/dir'
        res = sb.storage.from_(bucket).list(current or "", {"limit": 1000, "offset": 0})
        # res is a list of dicts with 'name' and 'id'/'metadata' depending on SDK version
        for entry in res:
            name = entry.get("name")
            if not name:
                continue
            # Newer SDKs provide "id" for files and "id" is absent for folders; sometimes "type": "folder"
            entry_type = entry.get("type")
            is_folder = entry_type == "folder" or ("id" not in entry and not name.count("."))
            if is_folder:
                next_dir = f"{current}/{name}" if current else name
                queue.append(next_dir)
            else:
                path = f"{current}/{name}" if current else name
                files.append(path)
    return files

def download_file_bytes(bucket: str, path: str) -> bytes:
    """Download a storage object as bytes."""
    sb = get_supabase()
    data = sb.storage.from_(bucket).download(path)
    # In v2, download returns bytes directly
    return data