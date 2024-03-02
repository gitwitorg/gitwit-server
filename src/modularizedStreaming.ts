import { Stream } from 'openai/streaming';
import { OpenAI } from 'openai';
import { writeFile, mkdir, access, constants } from 'fs/promises'; // Import necessary functions

import path from 'path';

const fileContentPattern = /File Name: (.+?)\n+```[\s\S]+?\n([\s\S]+?)```/gm;


export type ModularizedChunk = {
  type: 'text' | 'dependencies' | 'fileName';
  content: any;
  fileName?: string; // Optional field to indicate which file the chunk belongs to
};


export class CodeToFileStream {
  outputDir: string;
  fullResponseFilePath: string;

  constructor(outputDir: string) {
      this.outputDir = outputDir;
      this.fullResponseFilePath = path.join(this.outputDir, 'outputOpenAI.txt');
  }

  async initialize() {
      console.log(`Initializing output directory at: ${this.outputDir}`);
      try {
          await mkdir(this.outputDir, { recursive: true });
          console.log(`Directory initialized.`);
      } catch (error) {
          console.error('Error creating directory:', error);
      }

      try {
          await writeFile(this.fullResponseFilePath, '');
          console.log(`Full response file initialized at ${this.fullResponseFilePath}`);
      } catch (error) {
          console.error('Error initializing full response file:', error);
      }
  }

  async pushStream(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>) {
      let fullText = '';

      for await (const part of stream) {
          const message = part.choices[0]?.delta?.content;
          if (message) {
              fullText += message;
          }
      }

      console.log(`Saving full response to ${this.fullResponseFilePath}`);
      await writeFile(this.fullResponseFilePath, fullText);
      console.log(`Full response saved.`);

      console.log(`Processing and saving individual files from the full response...`);
      console.log(fullText)
      this.processAndSaveFiles(fullText);
  }

  processAndSaveFiles(fullText: string) {
      let match;
      while ((match = fileContentPattern.exec(fullText)) !== null) {
          const fileName = match[1].trim();
          const content = match[2].trim();
          console.log(`Found file: ${fileName}, preparing to save...`);
          this.saveFile(fileName, content);
      }
  }

  async saveFile(fileName: string, content: string) {
      const filePath = path.join(this.outputDir, fileName);
      console.log(`Preparing to save file: ${filePath}`);

      try {
          await access(filePath, constants.F_OK);
          console.log(`${filePath} exists. Overwriting...`);
      } catch {
          console.log(`${filePath} does not exist. Creating new file...`);
      }

      try {
          await writeFile(filePath, content);
          console.log(`File saved: ${filePath}`);
      } catch (error) {
          console.error(`Error saving file: ${filePath}`, error);
      }
  }
}