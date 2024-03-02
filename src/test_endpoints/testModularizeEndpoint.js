(async () => {
  const fs = require('fs').promises;

  // Dynamically import node-fetch
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

  const inputFilePath = '/home/aman23/gitwit_ws/gitwit-server/src/project_sim/codeToModularize.js';
  const projectTree = `
    project/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   └── index.js
    ├── README.md
    └── package.json
  `.trim();

  // Function to read the JavaScript file
  async function readFileContents(path) {
    try {
      const contents = await fs.readFile(path, 'utf8');
      return contents;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  // Read the code from the file
  const srcFilesContents = await readFileContents(inputFilePath);

  // Prepare the body for the POST request
  const requestBody = {
    projectTree: projectTree,
    srcFilesContents: srcFilesContents,
    errorFlag: false,
  };

  fetch('http://localhost:3001/modularize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.text(); // Assuming the response is text; adjust if JSON
  })
  .then(text => {
      console.log('Response from /modularize:', text);
      // Further processing of the response
  })
  .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
  });
})();
