from typing import Union
from openai import OpenAI
from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import Union, List
import shutil
import os
import glob
import hashlib
from datetime import datetime, timezone

app = FastAPI()
openai_client = OpenAI()

# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/channel/{channel_id}/summarize")
def summarize_channel(channel_id: int):
    # Retrieve all of the messages for the given channel id
    messages = ['Metal 41 this is Mesa. Say position', 'Say status of line 5.', 'We are on deck at LZ Dodo']

    # Pass them to ChatGPT to get a summary
    summary = summarize_text(messages)

    # Return the summary to the caller
    return {"summary": summary}
    # Test commit again again



def summarize_text(messages, model="gpt-4", max_tokens=150):
    prompt = """
    Your job is to summarize the content of military radio transmissions. Summarize as if you are a third party observer of the conversation, not an acitve participant. 
    Most transmissions will adhere to the following format: who is being called, followed by the callsign of whomever is calling followed by the message.
    Do not assume anything that is not directly stated.

    As an example, if one message is "Mesa 41, this is Metal. We have a direct hit" followed by "This is Mesa 41, sounds good.", a summary could be "Metal has a direct hit which Mesa 41 acknowledged".

    Here come the transmissions.
    """
    messages_processed = [{"role": "system", "content": prompt}]
    for m in messages:
        messages_processed.append({"role": "user", "content": m})

    print(messages_processed)

    response = openai_client.chat.completions.create(
        model=model,
        messages=messages_processed
    )

    return response.choices[0].message.content


@app.post("/channel/{channel_id}")
async def upload_audio(channel_id: int, files: List[UploadFile] = File(...)):
    uploaded_files = []
    for file in files:
        valid_file_extenstions = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
        valid_file_extensions_str = ', '.join(valid_file_extenstions)

        if not file.filename.endswith(tuple(valid_file_extensions_str)):
            raise HTTPException(status_code=400, detail=f'Invalid file type. Only {valid_file_extensions_str} files are allowed.')
        
        # Create a unique hash for the file
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        file_hash = hashlib.md5(file.file.read()).hexdigest()
        file.file.seek(0)  # Reset file pointer after reading

        # Create a new filename using the hash
        audio_file_extension = os.path.splitext(file.filename)[1]
        audio_filename = f"{file_hash}{audio_file_extension}"

        audio_file_dir = f"{UPLOAD_DIR}/{channel_id}/{timestamp}/{file_hash}/audio"
        # Create the directory if it doesn't exist
        os.makedirs(audio_file_dir, exist_ok=True)

        audio_file_location = f"{audio_file_dir}/{audio_filename}"

        with open(audio_file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        audio_filename = f"{file_hash}.txt"

        # Create the transcription file path
        transcription_dir = f"{UPLOAD_DIR}/{channel_id}/{timestamp}/{file_hash}/transcription"
        os.makedirs(transcription_dir, exist_ok=True)

        transcription_file_location = f"{transcription_dir}/{audio_filename}"

        # Transcribe the audio file and save the transcription to the text file
        transcription = transcribe_audio(audio_file_location)
        if transcription is not None:
            with open(transcription_file_location, "w") as f:
                f.write(transcription)

    return {"audio_file_key": audio_file_location, "transcription_file_key": transcription_file_location}

@app.get("/channel/{channel_id}/transcriptions")
async def get_transcriptions_for_channel(channel_id: int):
    # Get all the files in the channel directory
    channel_dir = f"{UPLOAD_DIR}/{channel_id}"
    if not os.path.exists(channel_dir):
        return []

    text_files =  glob.glob(f'{channel_dir}/**/*.txt', recursive=True)

    channel_transcriptions = {}
    for file in text_files:
        with open(file, "r") as f:
            channel_transcriptions[file] = f.read()

    return channel_transcriptions


def transcribe_audio(file_path: str) -> Union[str, None]:
    """
    Transcribes an audio file using OpenAI's Whisper model.

    :param file_path: Path to the audio file.
    :return: The transcription of the audio file or None if there's an error.
    """
    try:
        with open(file_path, "rb") as audio_file:
            transcription = openai_client.audio.transcriptions.create(model="whisper-1", file=audio_file, response_format="text")
        return transcription
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
