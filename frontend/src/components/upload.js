// pages/index.js or any component file
'use client';
import { useRef, useState } from 'react'; // Import useRef hook
import '../app/globals.css'

export default function AudioUpload({ onFileChange }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null); // Create a ref for the file input
    const [caption, setCaption] = useState('');
    const [text, setText] = useState('');
    
    const handleFileChange = async (e) => {
      console.log(e);
    
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        onFileChange(file);
        // Reset the file input after selection to allow the same file to be selected again
        e.target.value = '';
      } else {
        return;
      }
  
      // Prepare the file for uploading
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // A simple way to generate a unique file name
      const filePath = `${fileName}`;
  
      const requestData = {
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        prompt: "Q: Is this a blue dress?\nA:",
        temperature: 0.8,
        top_p: 0.7,
        top_k: 50,
        max_tokens: 1,
        repetition_penalty: 1
      };
  
    //   const response = await fetch("/api/chat", {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify(requestData),
    //     }
    //   );
    //   const result = await response.json();
    //   console.log(result); 
  
    };
  
    const handleUploadClick = () => {
      fileInputRef.current.click(); // Programmatically click the hidden file input
    };

  return (
    <div className='w-[23%] h-full justify-center items-center'>
      <form className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-1 lg:text-center">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange} // Handle file selection
            style={{ display: 'none' }} // Hide the file input
            accept="image/*" // Accept images only
          />
          <button
            type="button"
            className="buttonClass"
            onClick={handleUploadClick}
          >
            <h2>
            Upload{" "}
            </h2>
          </button>
        </form>
    </div>
  );
}