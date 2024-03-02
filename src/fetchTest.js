fetch("http://localhost:3001/generate", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "authorization": "Bearer YOUR_AUTH_TOKEN", // Replace YOUR_AUTH_TOKEN with your actual token
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "Referer": "http://localhost:3000/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "{\"command\":\"add user data input form\",\"code\":\"import React from 'react'\\n\\nexport default function App() {\\n  return (\\n    <div className=\\\"flex justify-center items-center h-screen\\\">\\n        <h1 className=\\\"font-semibold\\\">\\n          Welcome to my app!\\n        </h1>\\n    </div>\\n  )\\n}\",\"userId\":\"729e2c4c-3ed9-4e9d-87af-c820590ef386\"}",
  "method": "POST"
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    // Processing the response as a stream
    const reader = response.body.getReader();
    return new ReadableStream({
        start(controller) {
            function push() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        controller.close();
                        return;
                    }
                    controller.enqueue(value);
                    push();
                }).catch(err => {
                    console.error('Stream reading error:', err);
                    controller.error(err);
                });
            }
            push();
        }
    });
})
.then(stream => {
    // Decoding the stream
    return new Response(stream).text();
})
.then(text => {
    // Assuming each chunk is a JSON object, split by new lines
    const chunks = text.trim().split('\n');
    chunks.forEach(chunk => {
        try {
            const data = JSON.parse(chunk);
            console.log(data);
        } catch (e) {
            console.error('Error parsing chunk:', e);
        }
    });
})
.catch(error => {
    console.error('There was a problem with your fetch operation:', error);
});
