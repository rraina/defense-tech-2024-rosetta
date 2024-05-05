'use client';
import { useState, useRef } from 'react';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file); // This will read the file and encode it as Base64
  });
}

async function uploadAudioFile(file, url) {
  // Create a new FormData object to hold the file
  let formData = new FormData();
  formData.append("files", file);

  try {
      // Send a POST request with the audio file
      let response = await fetch(url+"channel/10?is_testing=true", {
          method: "POST",
          body: formData,
      });

      // Check if the request was successful
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the response JSON if successful
      let result = await response.json();
      return result;
  } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
  }
}

export default function Chat({ title }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef(null); // Create a ref for the file input
  const [selectedFile, setSelectedFile] = useState(null);

  const sendMessage = (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    // if (input.trim()) {
    //   setMessages([...messages, input]);
    //   setInput('');
    // }
  };
  
  const handleAskClick = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    setMessages([...messages, {type:"upload", body: input}]);
    try {
      // Send a POST request with the audio file
      let response = await fetch("https://496c-4-78-254-114.ngrok-free.app/channel/1/summarize?is_testing=true", {
        method: "POST",
        body: input,
      });
      
      // Check if the request was successful
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the response JSON if successful
      let result = await response.json();
      console.log(result);
     setMessages([...messages, {type:"summary", body: result.summary}]);

      return result;
    } catch (error) {
        console.error("Error summarizing.", error);
        throw error;
    }
  };

  const handleSummaryMultConvClick = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    try {
      // Send a POST request with the audio file
      let response = await fetch("https://496c-4-78-254-114.ngrok-free.app/channel/1/summarize?is_testing=true", {
          method: "GET"
      });
      
      // Check if the request was successful
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the response JSON if successful
      let result = await response.json();
      console.log(result);
     setMessages([...messages, {type:"summary", body: result.summary}]);

      return result;
    } catch (error) {
        console.error("Error summarizing.", error);
        throw error;
    }
  };

  const handleSummaryOperClick = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    try {
      // Send a POST request with the audio file
      let response = await fetch("https://496c-4-78-254-114.ngrok-free.app/channel/1/summarize?is_testing=true", {
          method: "GET"
      });
      
      // Check if the request was successful
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the response JSON if successful
      let result = await response.json();
      console.log(result);
     setMessages([...messages, {type:"summary", body: result.summary}]);

      return result;
    } catch (error) {
        console.error("Error summarizing.", error);
        throw error;
    }
  };
  
  const handleSummaryClick = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    
    try {
      // Send a POST request with the audio file
      let response = await fetch("https://496c-4-78-254-114.ngrok-free.app/channel/1/summarize?is_testing=true", {
          method: "GET"
      });
      
      // Check if the request was successful
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the response JSON if successful
      let result = await response.json();
      console.log(result);
     setMessages([...messages, {type:"summary", body: result.summary}]);

      return result;
    } catch (error) {
        console.error("Error summarizing.", error);
        throw error;
    }
  };
  

  const handleFileChange = async (e) => {
    console.log(e);
  
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Reset the file input after selection to allow the same file to be selected again
      e.target.value = '';
    } else {
      return;
    }

    uploadAudioFile(file, "https://496c-4-78-254-114.ngrok-free.app/")
    .then(result => console.log("File uploaded successfully:", result))
    .catch(error => console.error("File upload failed:", error));

    console.log(file);
    setMessages([...messages, {type:"upload", body: file.name+" is uploaded."}]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden file input
  };

  return (
    <div className="container mx-auto h-full w-full">
      <div className="h-full flex flex-col justify-between">
        <div className="h-1/6 flex items-center justify-center text-black text-4xl">
          <h1>{title}</h1>
        </div>
        <div className="overflow-y-auto h-4/6 p-4 bg-slate-300 rounded-md">
          {messages.map((message, index) => (
            message.type === "summary"? (
              <div key={index} className="mb-2 p-4 bg-green-700 text-black rounded-md">
                Important: {message.body}
              </div>
            ) : (
              <div key={index} className="mb-2 p-4 bg-blue-400 text-black rounded-md">
                {message.body}
              </div>
            )
          ))}
        </div>
        <form className="flex mt-2 p-4 h-1/6 bg-slate-300 rounded-md" onSubmit={sendMessage}>
          <div className='flex items-center justify-between h-full w-full'>
          {/* <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow mr-4 p-2 bg-gray-500 rounded-md text-black"
            placeholder="Type your message..."
          /> */}
          { title === "Summarize" ? (
            <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow mr-4 p-2 bg-gray-500 rounded-md text-black"
              placeholder="Type your question..."
            />
            <button
              type="submit"
              onClick={handleAskClick}
              className="bg-blue-400 hover:bg-blue-900 text-black py-2 rounded w-full mr-2"
            >
              Ask
            </button>
            <button
              type="submit"
              onClick={handleSummaryMultConvClick}
              className="bg-blue-400 hover:bg-blue-900 text-black py-2 rounded w-full mr-2"
            >
              Summarize multichannel
            </button>
            <button
              type="submit"
              onClick={handleSummaryOperClick}
              className="bg-blue-400 hover:bg-blue-900 text-black py-2 rounded w-full mr-2"
            >
              Summarize operator
            </button>
          </>
          ) :
          (<><input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange} // Handle file selection
            style={{ display: 'none' }} // Hide the file input
          />
          <button
            type="submit"
            onClick={handleSummaryClick}
            className="bg-blue-400 hover:bg-blue-900 text-black py-2 rounded w-full mr-2"
          >
            Summarize Conversations
          </button>
          <button
            type="submit"
            onClick={handleUploadClick}
            className="bg-blue-400 hover:bg-blue-900 text-black py-2 rounded w-full mr-2"
          >
            Upload Audio comms
          </button></>)
          }
          </div>
        </form>
      </div>
    </div>
  );
}
