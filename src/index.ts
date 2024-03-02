import { detectImportStatements } from "./utils/codegen";
import { DependencyIndex } from "./utils/dependencies";
import { CodeStream, Chunk } from "./streaming";
import { CodeToFileStream } from './modularizedStreaming'; 
import OpenAI from "openai";

import dotenv from 'dotenv';
dotenv.config();

// Azure deployment details
const azureDomain = "gitwit-production";
const deployment = "gpt-35-turbo";
const apiVersion = "2023-07-01-preview";

// Components of the Azure OpenAI API request
const defaultQuery = { "api-version": apiVersion };
const headers = { "api-key": process.env.AZURE_API_KEY };

// Create an Azure OpenAI client
// Here, MOCK_API is used for a testing with a local mock server
const openai = new OpenAI(
  process.env.MOCK_API
    ? {
        baseURL: process.env.MOCK_API,
      }
    : process.env.HELICONE_API_KEY
    ? {
        baseURL: `https://oai.hconeai.com/openai/deployments/${deployment}`,
        defaultHeaders: {
          "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
          "Helicone-OpenAI-API-Base": `https://${azureDomain}.openai.azure.com`,
          ...headers,
        },
        defaultQuery,
      }
    : {
        baseURL: `https://${azureDomain}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
        defaultHeaders: headers,
        defaultQuery,
      }
);

type StreamCodeGenerationParams = {
  inputCode: string;
  command: string;
  writeChunk: (chunk: Chunk) => void;
  errorHandler: (error: any) => void;
  userId?: string;
  chatHeaders?: Record<string, any>;
};

type ModularizeCodeGenerationParams = {
  projectTree: string;  // Contents of the project tree text file
  srcFilesContents: string;  // Contents of the src files text file
  errorFlag: boolean;
  writeChunk: (chunk: Chunk) => void;
  errorHandler: (error: any) => void;
  userId?: string;
  chatHeaders?: Record<string, any>;
};

export async function modularizeCodeGeneration({
  projectTree,  
  srcFilesContents,
  errorFlag,
  // writeChunk,
  // errorHandler,
  userId,
  chatHeaders = {},
}: ModularizeCodeGenerationParams): Promise<void> {
  let stream;
  try {
    const errorStatusText = errorFlag ? "Error detected." : "No errors.";
    const additionalGuidelines = `
    - Use inline Tailwind classes instead of external CSS files.
    - Use icon libraries instead of SVGs.
    - Avoid adding <svg> tags directly.
    - Include and utilize external libraries as necessary.
    - Create reusable React components to minimize code redundancy.
    - For image placeholders, use "https://via.placeholder.com/[WIDTH]x[HEIGHT]/[RRGGBB]/FFFFFF".
    `.trim();

    const prompt = `
    **Project Modularization Task: ReactJS & Tailwind CSS**

    **Project Overview:**
    - Role: Front-end Developer
    - Frameworks: ReactJS, Tailwind CSS
    - Current State: ${errorStatusText}
    - Project Tree:
    \`\`\`
    ${projectTree}
    \`\`\`

    **Objective:**
    Modularize the current proejct within the src/ directory, ensuring functional integrity. You are only allwoed to make new .js files for modularisation within the src folder you cannot make directories within src

    **Modularization Instructions:**
    1. Create only one more new .js file within src/ for each modularization step. Do not create new folders.
    2. Address any errors before proceeding to further modularization.
    3. Provide updated project tree and file contents after each step.

    **Expected Output Format:**
    - **Project Tree:** Updated project tree structure.
    - **File Contents:** For each file, including App.js and any new files, list the file name followed by its contents. Use the format "File Name: [filename.js]" as a delimiter for each file's contents.

    **Files:**
    ${srcFilesContents}

    **Guidelines:**
    ${additionalGuidelines}

    **AI Note:**
    For each iteration, provide the modularization steps in a structured format: update the project tree, list new or modified file names with their contents, and follow the specified output format for clarity.

    **End of Prompt**
    `.trim();

    // Printing the prompt for verification before sending the request
    console.log("Sending the following prompt to OpenAI:\n", prompt);

    // Make the streaming request to OpenAI
    stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      user: userId,
      // ... [additional OpenAI API request parameters]
    }, {
      headers: chatHeaders,
      // ... [additional request headers]
    });
  } catch (e: any) {
    console.error("Error creating stream:", e.message);
    return;
  }

  // Handle the streaming response
  if (stream) {
    try {
      // Specify the path where you want to save the output
      const outputFilePath = '/home/aman23/gitwit_ws/gitwit-server/src/project_sim/';

      // Use the CodeToFileStream class to write the output to a file
      const fileStream = new CodeToFileStream(outputFilePath);
      await fileStream.pushStream(stream);
      
      // After streaming is done, you can log a message or handle further actions
      console.log(`Output saved to ${outputFilePath}`);
    } catch (e: any) {
      console.error("Error handling streaming response:", e.message);
    }
  }
}


export async function streamCodeGeneration({
  inputCode,
  command,
  userId,
  writeChunk,
  errorHandler,
  chatHeaders = {},
}: StreamCodeGenerationParams): Promise<void> {
  // Make a streaming request to the OpenAI API
  let stream;
  try {
    // Create the prompt
    const prompt = [
      "```javascript\n" + inputCode + "\n```",
      "You are a a front-end developer working on a ReactJS and Tailwind project.",
      "Your task is to take the above code (a complete file) and modify it to",
      command,
      "Make all of your changes within this single file, and do not assume any additional files.",
      "Do not include any instructions aside from the code.",
      "Additional guidelines:",
      "Use inline Tailwind classes instead of external CSS files.",
      "Use icon libraries instead of SVGs.",
      "Never add <svg> tags.",
      "If required, include and use external libraries.",
      "Create reusable React components where needed to reduce the amount of code.",
      "Only if images are required for the given task, use placeholder URLs in the form of `https://via.placeholder.com/[WIDTH]x[HEIGHT]/[RRGGBB]/FFFFFF`."
    ].join("\n");
    stream = await openai.chat.completions.create(
      {
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        user: userId,
      },
      {
        headers: chatHeaders,
      }
    );
  } catch (e: any) {
    console.log("Error creating stream:", e.message);
    errorHandler(e);
  }

  // Stream the response back to the client
  if (stream) {
    try {
      const codeStream = new CodeStream(writeChunk);
      await codeStream.pushStream(stream);
    } catch (e: any) {
      // If an error occurs after the stream has started:
      console.log("Error streaming response:", e.message);
      errorHandler(e);
    }
  }
}

export async function dependenciesFromCode(code: string) {
  const dependencyIndex = new DependencyIndex();
  const dependencies = detectImportStatements(code);
  dependencies.forEach((dependency) =>
    dependencyIndex.fetchVersion(dependency)
  );
  await dependencyIndex.versionRequests.waitUntilFinished();
  dependencyIndex.peerDependencies.forEach((dependency) =>
    dependencyIndex.fetchVersion(dependency)
  );
  await dependencyIndex.versionRequests.waitUntilFinished();
  return dependencyIndex.dependencies();
}

export async function generateCode(
  inputCode: string,
  command: string
): Promise<{ code: string; dependencies: { [key: string]: string } }> {
  const codeChunks: string[] = [];
  let dependencies: { [key: string]: string } = {};
  await streamCodeGeneration({
    inputCode,
    command,
    writeChunk: (chunk) => {
      if (chunk.type === "text") {
        codeChunks.push(chunk.content);
      }
      if (chunk.type === "dependencies") {
        dependencies = Object.assign({}, dependencies, chunk.content);
      }
    },
    errorHandler: (e) => {
      throw e;
    },
  });
  return { code: codeChunks.join(""), dependencies };
}



