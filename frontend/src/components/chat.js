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
      let response = await fetch(url+"channel/10", {
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
  const [showAsk, setShowAsk] = useState(false);  // State to control visibility
  const [showOperator, setShowOperator] = useState(false);  // State to control visibility
  
  const sendMessage = (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    // if (input.trim()) {
    //   setMessages([...messages, input]);
    //   setInput('');
    // }
  };
  
  const handleAskClick = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    let messageAsk = []
    if (showAsk) {
      messageAsk.push({type:"upload", body: input});
      
      try {
        // Send a POST request with the audio file
        let response = await fetch(`https://2c3e0608831a.ngrok.app/channels/query?query=${input}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          }
        });
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Return the response JSON if successful
        let result = await response.json();
        console.log(result);
        messageAsk.push({type:"summary", body: result.summary});

        setMessages([...messages, ...messageAsk]);
        setShowAsk(false);
        return result;
      } catch (error) {
        console.error("Error summarizing.", error);
        setShowAsk(false);
        throw error;
      }
    } else {
      setShowAsk(true);
    }
  };

  const handleSummaryMultConvClick = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    try {
      // Send a POST request with the audio file
      let response = await fetch("https://2c3e0608831a.ngrok.app/channels/summarize", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...new Headers({
               'ngrok-skip-browser-warning': true,
            }),
          }
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

    if (showOperator) {
      try {
        // Send a POST request with the audio file
        let response = await fetch(`https://2c3e0608831a.ngrok.app/operator/summarize?operator_id=${input}`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            }
        });
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Return the response JSON if successful
        let result = await response.json();
        console.log(result);
        setMessages([...messages, {type:"summary", body: result.summary}]);
        setShowOperator(false);
        return result;
      } catch (error) {
        console.error("Error summarizing.", error);
        setShowOperator(false);
        throw error;
      }
    } else {
      setShowOperator(true);
    }
  };
  
  const handleSummaryClick = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    
    try {
      // Send a POST request with the audio file
      let response = await fetch("https://2c3e0608831a.ngrok.app/channel/1/summarize", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...new Headers({
               'ngrok-skip-browser-warning': true,
            }),
          }
      });
      console.log(response);
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

    uploadAudioFile(file, "https://2c3e0608831a.ngrok.app/")
    .then(result => {
      console.log("File uploaded successfully:", result);
      if (result.alert) {
        setMessages([...messages, {type:"alert", body: file.name+" is uploaded."}]);
      } else {
        setMessages([...messages, {type:"upload", body: file.name+" is uploaded."}]);
      }
    })
    .catch(error => console.error("File upload failed:", error));

    console.log(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden file input
  };

  return (
    <div className="container mx-auto h-full w-full">
      <div className="h-full flex flex-col justify-between">
        <div className="h-1/6 flex flex-col items-center justify-center text-white text-4xl font-bold">
          <h1>{title}</h1>
          {
            title === "Summarize" ? (<></>) : (
            <p className="items-center justify-center text-white text-sm">Ben, Brian</p>
            )
          }
        </div>
        <div className="overflow-y-auto h-4/6 p-4 bg-custom-gray rounded-md">
          {messages.map((message, index) => (
            message.type === "summary"? (
              <div key={index} className="w-3/4 ml-auto mb-2 p-4 bg-green-700 text-white rounded-md">
                {message.body}
              </div>
            ) : message.type === "alert"?  (
                <div key={index} className="w-3/4 mb-2 p-4 bg-red-400 text-black rounded-md">
                  {message.body}
                </div>) : (
              <div key={index} className="w-3/4 mb-2 p-4 bg-blue-400 text-black rounded-md">
                {message.body}
              </div>
            )
          ))}
        </div>
        <form className="flex mt-2 p-4 h-1/6 bg-custom-gray rounded-md" onSubmit={sendMessage}>
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
            {showAsk || showOperator ? (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow mr-4 p-2 bg-gray-500 rounded-md text-black"
              placeholder="Type your question..."
            />) : null}
            <button
              type="submit"
              onClick={handleAskClick}
              className="bg-custom-gray-light hover:bg-gray-500 text-black py-2 rounded w-full mr-2"
            >
              Ask
            </button>
            <button
              type="submit"
              onClick={handleSummaryMultConvClick}
              className="bg-custom-gray-light hover:bg-gray-500 text-black py-2 rounded w-full mr-2"
            >
              Summarize multichannel
            </button>
            <button
              type="submit"
              onClick={handleSummaryOperClick}
              className="bg-custom-gray-light hover:bg-gray-500 text-black py-2 rounded w-full mr-2"
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
            className="bg-custom-gray-light hover:bg-gray-500 text-black py-2 rounded w-full mr-2"
          >
            Summarize Conversations
          </button>
          <button
            type="submit"
            onClick={handleUploadClick}
            className="bg-custom-gray-light hover:bg-gray-500 text-black py-2 rounded w-full mr-2"
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
