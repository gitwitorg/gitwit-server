import { detectImportStatements } from "./utils/codegen";
import { DependencyIndex } from "./utils/dependencies";
import { CodeStream, Chunk } from "./streaming";
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
      "Do not add <svg>s.",
      "If required, include and use external libraries.",
      "If required, use composable programming patterns to reduce the amount of code.",
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
