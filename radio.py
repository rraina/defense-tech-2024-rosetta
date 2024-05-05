import sounddevice as sd
import numpy as np
import wave
import requests
import time

SAMPLE_RATE = 44100  # Sampling rate
DURATION = 5         # Duration to record in seconds
CHANNELS = 1         # Number of audio channels (1 for mono, 2 for stereo)
CHANNEL_ID = 1
IS_TESTING = True
UPLOAD_URL = 'http://localhost:8000/channel/' + str(CHANNEL_ID)  # Update this with your actual API URL
WAV_FILENAME_TEMPLATE = 'output_{timestamp}.wav'


def generate_filename(template: str) -> str:
    """Generate a unique filename based on the provided template."""
    timestamp = time.strftime('%Y%m%d_%H%M%S')
    return template.format(timestamp=timestamp)


def record_audio(filename: str, duration: int = DURATION, sample_rate: int = SAMPLE_RATE, channels: int = CHANNELS):
    """Record audio and save it as a WAV file."""
    print(f"Recording for {duration} seconds...")

    # Record audio
    recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=channels, dtype='int16')
    sd.wait()  # Wait until recording is finished

    # Write the recording to a .wav file
    wave_file = wave.open(filename, 'wb')
    wave_file.setnchannels(channels)
    wave_file.setsampwidth(2)  # Sample width in bytes (2 bytes = 16-bit audio)
    wave_file.setframerate(sample_rate)
    wave_file.writeframes(recording.tobytes())
    wave_file.close()

    print(f"Recording saved to {filename}")


def upload_audio(filename: str, channel_id: int, is_testing: bool, upload_url: str = UPLOAD_URL):
    """Upload the WAV file to the specified API endpoint."""
    with open(filename, 'rb') as audio_file:
        files = {'files': (filename, audio_file, 'audio/wav')}
        data = {'channel_id': channel_id, 'is_testing': str(is_testing).lower()}

        response = requests.post(upload_url, files=files, data=data)

        if response.status_code == 200:
            print(f"File {filename} uploaded successfully!")
        else:
            print(f"Error uploading {filename}: {response.status_code}, {response.text}")


def main():
    # Generate a unique filename
    wav_filename = generate_filename(WAV_FILENAME_TEMPLATE)

    # Record audio
    record_audio(wav_filename)

    # Upload the recorded audio file
    upload_audio(wav_filename, CHANNEL_ID, IS_TESTING)


if __name__ == '__main__':
    main()
