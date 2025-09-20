from fastapi import FastAPI, Form, UploadFile, File, Body
from fastapi.responses import JSONResponse, StreamingResponse
import uuid
from dotenv import load_dotenv
import os
from typing import List as TList, Optional, Dict
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware

# Load base .env first
load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET")
SUPABASE_FOLDER = os.getenv("SUPABASE_FOLDER", "")  # optional subfolder

_supabase_client: Optional[Client] = None

app = FastAPI()

# Allow the local Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust if your frontend runs on a different origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        files: TList[str] = []

        # Initialize the queue with the starting folder. Use "" for the bucket root.
        queue: TList[str] = [folder.strip("/") if folder else ""]

        while queue:
            current_path = queue.pop(0)

            # The list method with no path lists the root. Pass an empty string for the root.
            res = sb.storage.from_(bucket).list(path=current_path, options={"limit": 100})

            if not res:
                continue

            for item in res:
                item_name = item.get("name")
                if not item_name:
                    continue

                # Check if the item is a folder. Supabase often returns a "type" key
                # or simply lacks an "id" for folders. We can also check if the name has no extension.
                is_folder = item.get("type") == "folder" or (item_name and '.' not in item_name and not item.get("id"))

                if is_folder:
                    # Add the full path of the folder to the queue for scanning
                    next_path = f"{current_path}/{item_name}" if current_path else item_name
                    queue.append(next_path)
                else:
                    # This is a file, so add its full path to the file list
                    full_file_path = f"{current_path}/{item_name}" if current_path else item_name
                    files.append(full_file_path)

        return files


def download_file_bytes(bucket: str, path: str) -> bytes:
    """Download a storage object as bytes."""
    print(f"Downloading {bucket}/{path}")
    sb = get_supabase()
    # The download method returns the bytes directly.
    return sb.storage.from_(bucket).download(path)


@app.post("/start")
async def start_analysis(
        context: str = Form(...)
):
    print("Starting Analysis with context:", context[:80])

    # Download all files from the specified folder in the bucket
    file_blobs = {}
    try:
        # 1. Get a list of all file paths
        paths = list_all_files(SUPABASE_BUCKET, SUPABASE_FOLDER)

        if not paths:
            print("No files found in the configured bucket/folder.")
            return JSONResponse({"detail": "No files found in the configured bucket/folder"}, status_code=404)

        # 2. Download each file and store it in a dictionary
        for p in paths:
            try:
                blob = download_file_bytes(SUPABASE_BUCKET, p)
                file_blobs[p] = blob
                print(f"Successfully downloaded file: {p}")
            except Exception as e:
                print(f"Failed to download {p}: {e}")
                return JSONResponse({"detail": f"Failed to download {p}: {e}"}, status_code=400)

        # 3. TODO: Integrate with your agents. Example:
        # results = run_document_agents(file_blobs, context=context)

    except Exception as e:
        print(f"Error during analysis: {e}")
        return JSONResponse({"detail": f"An unexpected error occurred during analysis: {e}"}, status_code=500)

    return JSONResponse({
        "jobId": str(uuid.uuid4()),
        "agents": [
            {"name": "Market Fit Agent", "status": "queued", "progress": 0},
            {"name": "Financials Agent", "status": "queued", "progress": 0},
            {"name": "Tech Diligence Agent", "status": "queued", "progress": 0},
        ]
    })


# Minimal status endpoint so the frontend polling succeeds
@app.get("/status/{job_id}")
async def get_status(job_id: str) -> TList[Dict]:
    # Return a simple simulated progress
    return [
        {"name": "Market Fit Agent", "status": "running", "progress": 40},
        {"name": "Financials Agent", "status": "queued", "progress": 0},
        {"name": "Tech Diligence Agent", "status": "queued", "progress": 0},
    ]