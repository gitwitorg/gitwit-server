const fs = require('fs').promises;
const fetch = require('node-fetch');
const { CodeToFileStream } = require('/home/aman23/gitwit_ws/gitwit-server/src/modularizedStreaming.ts'); // Adjust the path as necessary

// Path to the input JavaScript file
const inputFilePath = './project_sim/codeToModularize.js';

// Directory where the modularized files will be saved
const outputDirectory = '/home/aman23/gitwit_ws/gitwit-server/src/project_sim';

// Project tree structure
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
    throw error; // It's better to return null or handle the error gracefully
  }
}

// Function to send request to the /modularize endpoint and process the response
async function modularizeCode(inputCode) {
  try {
    const response = await fetch('http://localhost:3001/modularize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectTree: projectTree, // Pass the project tree structure
        srcFilesContents: inputCode,
        errorFlag: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    // Initialize the CodeToFileStream instance and prepare the output directory
    const codeStream = new CodeToFileStream(outputDirectory);
    await codeStream.initialize();

    // Process the full response text and save individual files
    codeStream.processAndSaveFiles(data); // Assuming this method exists and is correctly implemented

  } catch (error) {
    console.error('Error in modularizeCode:', error);
  }
}

// Main function to run the script
async function main() {
  try {
    const codeToModularize = await readFileContents(inputFilePath);
    await modularizeCode(codeToModularize);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();
