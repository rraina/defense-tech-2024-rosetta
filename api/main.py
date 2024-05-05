from typing import Union
from openai import OpenAI
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, List
import shutil
import os
import glob
import hashlib
from datetime import datetime, timezone

# CONSTANTS
NUM_CHANNELS = 3

### PROMPTS
PROMPT_EXAMPLE = """As an example, if one message is "Mesa 41, this is Metal. We have a direct hit" followed by "This is Mesa 41, sounds good.", a summary could be "Metal has a direct hit which Mesa 41 acknowledged". In this message, Mesa 41 and Metal were the operators involved in this conversation"""

def OPERATOR_ADDENDUM(operator: str):
    return "When developing your summary, only incorporate information from transmissions from the following operator: " + operator + "."

app = FastAPI()
# Allow all CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

openai_client = OpenAI()

# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/channel/{channel_id}/summarize")
def summarize_channel(channel_id: int, is_testing: bool = False):
    # Return hard coded data if testing
    if is_testing:
        return {"summary": "Gator 6 communicated with Viper to request a Hellfire attack on a building they're taking fire from. Viper confirmed this was possible and requested clarification if the attack was needed immediately, saying they could have a Hellfire on the building in about a minute. White 4 responded affirmatively to Viper’s request, but suggested directing the attack more towards the top of the building, where the fire is coming from. A moment would be needed to move their personnel back about 50 meters."}


    # Retrieve all of the messages for the given channel id
    messages = get_transcriptions_for_channel(channel_id)
    sorted_messages = dict(sorted(messages.items())).values()

    # Pass them to ChatGPT to get a summary
    summary = summarize_text(sorted_messages)
    
    return {"summary": summary}

@app.get("/channels/summarize")
def summarize_channels(is_testing: bool = False):
    # Return hard coded data if testing
    if is_testing:
        return {"summary": "Gator 6 communicated with Viper to request a Hellfire attack on a building they're taking fire from. Viper confirmed this was possible and requested clarification if the attack was needed immediately, saying they could have a Hellfire on the building in about a minute. White 4 responded affirmatively to Viper’s request, but suggested directing the attack more towards the top of the building, where the fire is coming from. A moment would be needed to move their personnel back about 50 meters."}

    # Hardcode number of channels, and retrieve all of the relevant data
    sorted_messages = []
    for channel_id in range(1, NUM_CHANNELS + 1):
        messages = get_transcriptions_for_channel(channel_id)
        sorted_messages += dict(sorted(messages.items())).values()

    # Pass them to ChatGPT to get a summary
    summary = summarize_text(sorted_messages)
    
    return {"summary": summary}

@app.get("/operator/summarize")
def summarize_operator(operator_id: str = None, is_testing: bool = False):
    if operator_id is None:
        raise HTTPException(status_code=422, detail="Please specify an operator")
    # Return hard coded data if testing
    if is_testing:
        return {"summary": "Gator 6 communicated with Viper to request a Hellfire attack on a building they're taking fire from. Viper confirmed this was possible and requested clarification if the attack was needed immediately, saying they could have a Hellfire on the building in about a minute. White 4 responded affirmatively to Viper’s request, but suggested directing the attack more towards the top of the building, where the fire is coming from. A moment would be needed to move their personnel back about 50 meters."}

    # Hardcode number of channels, and retrieve all of the relevant data
    sorted_messages = []
    transcriptions_per_channel = get_transcriptions_for_all_channels()
    for _, transcriptions in enumerate(transcriptions_per_channel):
        messages = dict(sorted(transcriptions.items())).values()
        sorted_messages += messages

    # Pass them to ChatGPT to get a summary
    summary = summarize_text(sorted_messages, prompt_addendums=OPERATOR_ADDENDUM(operator_id))
    
    return {"summary": summary}

def summarize_text(messages, prompt_addendums=PROMPT_EXAMPLE, model="gpt-4", max_tokens=150):
    prompt = """
    Your job is to summarize the content of military radio transmissions. Summarize as if you are a third party observer of the conversation, not an active participant. 
    Most transmissions will adhere to the following format: who is being called, followed by the callsign of whomever is calling followed by the message.
    Do not assume anything that is not directly stated.
    """ + prompt_addendums
    
    messages_processed = [{"role": "system", "content": prompt}]
    for m in messages:
        messages_processed.append({"role": "user", "content": m})

    print(messages_processed)
    try:
        response = openai_client.chat.completions.create(
            model=model,
            messages=messages_processed
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred: {e}")
        return None



@app.post("/channel/{channel_id}")
async def upload_audio(channel_id: int, files: List[UploadFile] = File(...), is_testing: bool = False):
    if is_testing:
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        file_hash = hashlib.md5("123".encode()).hexdigest()
        return {"audio_file_key": f"{UPLOAD_DIR}/{channel_id}/{timestamp}/{file_hash}/audio/123.mp4", "transcription_file_key": f"{UPLOAD_DIR}/{channel_id}/{timestamp}/{file_hash}/audio/123.mp4"}
    
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
def get_transcriptions_for_channel(channel_id: int):
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

@app.get("/channel/transcriptions")
def get_transcriptions_for_all_channels():
    all_transcriptions = {}
    for channel_id in range(1, NUM_CHANNELS + 1):
        channel_transcriptions = get_transcriptions_for_channel(channel_id)
        all_transcriptions[channel_id] = channel_transcriptions
    
    return all_transcriptions

def transcribe_audio(file_path: str) -> Union[str, None]:
    """
    Transcribes an audio file using OpenAI's Whisper model.

    :param file_path: Path to the audio file.
    :return: The transcription of the audio file or None if there's an error.
    """
    try:
        with open(file_path, "rb") as audio_file:
            transcription = openai_client.audio.transcriptions.create(model="whisper-1", file=audio_file, response_format="text", prompt="Hellfire, GFC, troops, tracer rounds,tally, Belt feds, MIG, RTB")
        return transcription
    except Exception as e:
        print(f"An error occurred: {e}")
        return None