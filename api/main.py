from typing import Union, List
import shutil
import os
import hashlib
from datetime import datetime, timezone



from fastapi import FastAPI, File, UploadFile, HTTPException

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/channel/{id}")
async def upload_audio(id: int, files: List[UploadFile] = File(...)):
    uploaded_files = []
    for file in files:
        valid_file_extenstions = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
        valid_file_extensions_str = ', '.join(valid_file_extenstions)

        if not file.filename.endswith(tuple(valid_file_extensions_str)):
            raise HTTPException(status_code=400, detail=f'Invalid file type. Only {valid_file_extensions_str} files are allowed.')
        
        # Create a unique hash for the file
        file_hash = hashlib.md5(file.file.read()).hexdigest()
        file.file.seek(0)  # Reset file pointer after reading

        # Create a new filename using the hash
        file_extension = os.path.splitext(file.filename)[1]
        new_filename = f"{file_hash}{file_extension}"
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")

        file_dir = f"{UPLOAD_DIR}/{id}/{timestamp}/{file_hash}/audio"
        # Create the directory if it doesn't exist
        os.makedirs(file_dir, exist_ok=True)

        file_location = f"{file_dir}/{new_filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        uploaded_files.append(file_location)
    
    return {"filenames": uploaded_files}
