import { Response } from 'express';
import { Stream } from 'openai/streaming';
import { OpenAI } from 'openai'

import { countOccurrences, getIndices } from './utils/regex';
import { detectImportStatements } from './utils/codegen';
import Queue from './utils/queue';
import { mostRecentVersion } from './utils/npm';

// Define a regular expression to detect code fences.
const fencePattern = /\n?```.*\n/;
const fenceLanguage = /\n?```(.*)\n/;

// Define a regular expression to detect unfinished code fences.
const partialFencePattern = /`(`(`[^\n]*)?)?$/;

// Use the knowledge cutoff date to find compatible dependencies.
const timeMachineDate = new Date('2023-04-01');

type VersionResultStatus = "loading" | "ready" | "sent";

const packageVersions: Record<string, Record<string, string>> = {
};

export class CodeStream {

    res: Response;          // The Express response object.
    streamedText: string;   // All text received from the OpenAI API.
    streamedCode: string;   // All text sent to the client.
    buffer: string;         // Text waiting to be pushed to the response.
    noCodeFence: boolean;   // Whether the response is using code fences.
    finished: boolean;      // Whether the last code fence was received.
    inBashBlock: boolean;  // Whether the current code fence block is a Bash script.
    inJSBlock: boolean;    // Whether the current code fence block is a JavaScript script.

    peerDependencies: Set<string>;
    versionRequests: Queue; // A queue of requests to the npm registry.
    versionResults: { [key: string]: string }; // A map of package names to their latest versions.
    versionResultStatuses: { [key: string]: VersionResultStatus }; // A map of package names to their latest versions.

    constructor(res: Response) {
        this.buffer = '';
        this.streamedText = '';
        this.streamedCode = '';
        this.noCodeFence = false;
        this.finished = false;
        this.inBashBlock = false;
        this.inJSBlock = false;
        this.versionRequests = new Queue();
        this.versionResults = {};
        this.peerDependencies = new Set();
        // Ignore these three because they are already included in the template.
        this.versionResultStatuses = {
            "react": "loading",
            "react-dom": "loading",
            "react-scripts": "loading"
        };
        this.res = res;
    }

    private async fetchVersion(packageName: string) {
        if (packageVersions.hasOwnProperty(packageName)) {
            for (const [dependencyName, version] of Object.entries(packageVersions[packageName])) {
                this.versionResults[dependencyName] = version;
                this.versionResultStatuses[dependencyName] = "ready";
            }
            return;
        }

        // Ensure that we only make one request per package.
        if (this.versionResultStatuses.hasOwnProperty(packageName)) return;
        this.versionResultStatuses[packageName] = "loading";

        // Add the version request to the queue.
        this.versionRequests.addTask(async () => {
            try {
                const version = await mostRecentVersion(packageName, timeMachineDate);
                this.versionResults[packageName] = version.version;
                // Add all peer dependencies to the list of dependencies.
                for (const key in version.peerDependencies) {
                    this.peerDependencies.add(key);
                }
            } catch (error) {
                console.error('Error fetching version for', packageName, error);
                this.versionResults[packageName] = '*';
            }
            this.versionResultStatuses[packageName] = "ready";
        });
    };

    // Push a list of dependencies to the client.
    private pushDependencies() {
        // Find all dependencies that are ready to be sent.
        const versionsToSend: { [key: string]: string } = {};
        for (const packageName in this.versionResultStatuses) {
            if (this.versionResultStatuses[packageName] === "ready") {
                this.versionResultStatuses[packageName] = "sent";
                versionsToSend[packageName] = this.versionResults[packageName];
            }
        }
        // Send the list of dependencies to the client.
        if (Object.keys(versionsToSend).length) {
            this.res.write(JSON.stringify({
                "type": "dependencies",
                "content": versionsToSend
            }) + "\n");
        }
    }

    // Push a chunk of text to the client.
    // This requires closing fences to be complete, but unfinished opening fences are OK.
    pushChunk(inChunk: string) {

        // This is a heuristic to detect if ChatGPT returned code without a code fence.
        // If the first character of the text is lowercase, we assume it's code.
        const isLowerCase = (letter: string) => letter === letter.toLowerCase() && letter !== letter.toUpperCase();
        if (this.streamedText.length === 0 && inChunk[0] && isLowerCase(inChunk[0])) {
            this.noCodeFence = true;
        }

        // Remove non-code text from the chunk.
        let outChunk = null;
        if (this.noCodeFence) {
            // If we started with no code fence, ignore future fences.
            outChunk = inChunk;
        } else {
            if (!this.inBashBlock && !this.inJSBlock && fencePattern.test(inChunk)) {
                // If the first fence is in this chunk, return everything after it.
                // Get the text from the fence pattern group
                const match = (fenceLanguage.exec(inChunk) || [null])[1];
                if (match == "bash") {
                    this.inBashBlock = true;
                } else {
                    this.inJSBlock = true;
                    outChunk = inChunk.split(fencePattern)[1];
                }
            } else if (this.inJSBlock) {
                if (fencePattern.test(inChunk)) {
                    // If the second fence is in this chunk, return everything before it.
                    const fences = getIndices(inChunk, fencePattern);
                    outChunk = inChunk.slice(0, fences[0]);
                    this.finished = true;
                } else {
                    // If we are past the first fence, but the second fence is not in this chunk, return the whole chunk.
                    outChunk = inChunk;
                }
            } else if (this.inBashBlock) {
                if (fencePattern.test(inChunk)) {
                    this.inBashBlock = false;
                } 
            }
        }

        if (outChunk) {
            // If a line has been completed, look for import statements.
            const currentNewline = outChunk.indexOf('\n\n');
            if (currentNewline >= 0) {
                // Find the end of the last completed line.
                const previousNewline = Math.max(this.streamedCode.lastIndexOf('\n\n'), 0)
                // Check all new complete lines for import statements.
                const dependencies = detectImportStatements(
                    this.streamedCode.slice(previousNewline)
                    + inChunk.slice(0, currentNewline)
                );
                // Fetch version numbers for all new dependencies.
                dependencies.forEach(dependency => this.fetchVersion(dependency));
            }

            // Push the chunk to the client.
            this.res.write(JSON.stringify({
                "type": "text",
                "content": outChunk
            }) + "\n");
            this.streamedCode = this.streamedCode + outChunk;

            // Push any new dependencies to the client.
            this.pushDependencies();
        }

        this.streamedText = this.streamedText + inChunk;
    }

    // Push a stream of text to the client.
    // Text is buffered to ensure that we don't parse unfinished closing code fences.
    async pushStream(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>) {

        for await (const part of stream) {
            // Add the input chunk to the buffer.
            const message = part.choices[0]?.delta?.content;
            if (message) this.buffer += message;

            // As long as there is not an unfinished code fence, parse and empty the buffer.
            if (!partialFencePattern.test(this.buffer)) {
                this.pushChunk(this.buffer);
                this.buffer = '';
            }

            // If we have received the last code fence, stop streaming.
            if (this.finished) {
                break;
            }
        }

        // If there is an unfinished code fence, push the buffer.
        // Add a newline to ensure that closing fences are recognized.
        this.pushChunk(this.buffer + (this.noCodeFence ? "" : "\n"));

        // Fetch version numbers for all peer dependencies.
        this.peerDependencies.forEach(dependency => this.fetchVersion(dependency));

        // Send the remaining list of dependencies to the client.
        await this.versionRequests.waitUntilFinished();
        this.pushDependencies();
    }
}