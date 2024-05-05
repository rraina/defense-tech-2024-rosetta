from typing import Union
import openai
from openai import OpenAI
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/channel/{channel_id}/summarize")
def summarize_channel(channel_id: int):
    # Retrieve all of the messages for the given channel id
    messages = ['Metal 41 this is Mesa. Say position', 'Say status of line 5.', 'We are on deck at LZ Dodo']

    # Pass them to ChatGPT to get a summary
    summary = summarize_text(messages)

    # Return the summary to the caller
    return {"summary": summary}
    # Test commit



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
    client = OpenAI()

    response = client.chat.completions.create(
        model=model,
        messages=messages_processed
    )

    return response.choices[0].message.content
