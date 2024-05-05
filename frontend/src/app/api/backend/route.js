// If you're using node-fetch in environments without native fetch support, uncomment the next line

export async function POST(req) {
    const requestBody = await req.json();
    console.log("requestBody is");
    console.log(requestBody);
    // const base64Data = requestBody.split(',')[1];

    if (req.method === 'POST') {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llava:34b-v1.6-q8_0",
          prompt: "What is the name of the company? You should output just the company name and nothing else.",
          images: [base64Data] // Assuming you pass imageData in the body of the request to this API route
        }),
      });

      const data = await response.text().then((text) => {
        const ans = text.match(/{.*?}/g);
        const jsonArray = ans.map(str => JSON.parse(str));
        let str = "";
        for (let i=0; i<jsonArray.length; i++) {
          str = str+jsonArray[i].response;
        }
        return str;
      });

      // Respond to the client
      return new Response(JSON.stringify({body:data}), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else if (req.method === 'GET') {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "llava:34b-v1.6-q8_0",
              prompt: "What is the name of the company? You should output just the company name and nothing else.",
              images: [base64Data] // Assuming you pass imageData in the body of the request to this API route
            }),
          });
    
    } else {
      // Handle any other HTTP methods
      return new Response(`Method ${req.method} Not Allowed`, {
        status: 405,
        headers: { 'Allow': ['POST', 'GET'] },
      });
    }
}
