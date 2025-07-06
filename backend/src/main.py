# src/main.py

"""
Main FastAPI application.

Defines endpoints to upload and parse SDAT/ESL XML files, store and
deduplicate their JSON representations on disk, fetch the aggregated
data, and clear all stored data.
"""

import os
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from .json_parser import convert_input, is_valid_sdat_entry

app = FastAPI()

# Allow your React dev server to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Where to keep your aggregated JSON ---
DATA_DIR = "data"
ESL_STORE = os.path.join(DATA_DIR, "esl-total.json")
SDAT_STORE = os.path.join(DATA_DIR, "sdat-total.json")


@app.on_event("startup")
def ensure_data_store():
    """
    Ensure the data directory and JSON store files exist.

    Creates the `data/` directory and initializes `esl-total.json`
    and `sdat-total.json` as empty arrays if they do not already exist.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    for path in (ESL_STORE, SDAT_STORE):
        if not os.path.isfile(path):
            with open(path, "w") as f:
                json.dump([], f, indent=2)


def save_batch(file_type: str, batch: Dict[str, Any]):
    """
    Merge a batch of parsed data into the on-disk store with deduplication.

    Args:
        file_type: 'sdat' or 'esl', indicating which store to update.
        batch: A dict containing either 'sdat-data' or 'esl-data' list.

    Raises:
        HTTPException: If an unsupported file_type is provided.
    """
    if file_type == "esl":
        store_path = ESL_STORE
        key = "esl-data"
    elif file_type == "sdat":
        store_path = SDAT_STORE
        key = "sdat-data"
    else:
        raise HTTPException(400, f"Unsupported file_type: {file_type}")

    # Load existing data
    with open(store_path, "r") as f:
        existing = json.load(f)

    # Append only new, valid entries
    to_add = batch.get(key, [])
    for entry in to_add:
        if file_type == "sdat" and not is_valid_sdat_entry(entry):
            continue
        
        # For ESL files, check for duplicates by month
        if file_type == "esl":
            month = entry.get("month")
            # Check if this month already exists
            month_exists = any(existing_entry.get("month") == month for existing_entry in existing)
            if not month_exists:
                existing.append(entry)
        # For SDAT files, use the original logic
        elif entry not in existing:
            existing.append(entry)

    # Write back
    with open(store_path, "w") as f:
        json.dump(existing, f, indent=2)


@app.post("/upload")
async def upload_files(
    file_type: str = Form(...),
    files: List[UploadFile] = File(...),
) -> Dict[str, Any]:
    """
    Handle file uploads: parse, dedupe, store, and return parsed batch.

    Args:
        file_type: Form field indicating 'sdat' or 'esl'.
        files: One or more uploaded XML files.

    Returns:
        A dict containing:
          - 'sdat-data' or 'esl-data': the newly converted entries
          - 'success': True if any entries were stored
          - 'error': Optional error message (on failure)
    """
    ft = file_type.lower()
    if ft not in ("sdat", "esl"):
        raise HTTPException(400, "Invalid file_type; must be 'sdat' or 'esl'")

    raw_results = []
    for upload in files:
        raw_bytes = await upload.read()
        try:
            content = raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            content = raw_bytes.decode("latin-1")

        raw_results.append({
            "filename": upload.filename,
            "content": content,
        })

    payload = {"type": ft, "files": raw_results}

    try:
        converted = convert_input(payload)
    except Exception as e:
        return {"success": False, "error": str(e)}

    # Persist & dedupe into our aggregate store
    save_batch(ft, converted)

    return {"success": True, **converted}


@app.get("/data-esl")
def get_all_esl() -> Dict[str, Any]:
    """
    Return the full stored ESL aggregate.

    Returns:
        A dict with key 'esl-data' mapping to the list of all stored entries.
    """
    with open(ESL_STORE, "r") as f:
        data = json.load(f)
    # Sort by 'month' field ascending
    data.sort(key=lambda x: x.get("month"))
    return {"esl-data": data}


@app.get("/data-sdat")
def get_all_sdat() -> Dict[str, Any]:
    """
    Return the full stored SDAT aggregate.

    Returns:
        A dict with key 'sdat-data' mapping to the list of all stored entries.
    """
    with open(SDAT_STORE, "r") as f:
        data = json.load(f)
    return {"sdat-data": data}


@app.get("/clear")
def clear_data() -> Dict[str, str]:
    """
    Wipe all stored data clean by emptying the JSON files.

    Returns:
        A message indicating all data stores have been cleared.
    """
    for path in (ESL_STORE, SDAT_STORE):
        with open(path, "w") as f:
            json.dump([], f, indent=2)
    return {"message": "All data stores have been cleared."}
