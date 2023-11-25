import express, { Application, Request, Response } from 'express';
import cors from 'cors'
import OpenAI from 'openai';

import { CodeStream } from './streaming';

import dotenv from 'dotenv';
dotenv.config();

import { ClerkExpressWithAuth, WithAuthProp, LooseAuthProp } from "@clerk/clerk-sdk-node";

// Create an Express application
const app: Application = express();

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(ClerkExpressWithAuth());

// Define a route handler for the root path
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

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
    process.env.MOCK_API ? {
        baseURL: process.env.MOCK_API
    } : process.env.HELICONE_API_KEY ? {
        baseURL: `https://oai.hconeai.com/openai/deployments/${deployment}`,
        defaultHeaders: {
            "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
            "Helicone-OpenAI-API-Base": `https://${azureDomain}.openai.azure.com`,
            ...headers
        },
        defaultQuery
    } : {
        baseURL: `https://${azureDomain}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
        defaultHeaders: headers,
        defaultQuery
    });

// Define a route handler for the API endpoint
app.post('/generate', async (req: WithAuthProp<Request>, res: Response) => {
    if ((req.auth.userId || req.body.userId) == undefined) {
        res.status(400).json({ error: "userId is required" });
        return;
    }

    // If the user is logged in, use their Clerk ID, otherwise use a cookie
    const userId = req.auth.userId ? req.auth.userId : `cookie:${req.body.userId}`;

    // Make a streaming request to the OpenAI API
    let stream;
    try {
        // Create the prompt
        const jsCode = "```javascript\n" + req.body.code + "\n```";
        const instruction = "Take the above code and modify it to";
        const stylePrompt = [
            "Return the complete code with the changes.",
            "Do not include any setup or installation commands.",
            "Use ReactJS and Tailwind.",
            "Use composable programming patterns to reduce the amount of code where appropriate.",
            "Do not add references to other files in the project.",
            "Include and use external libraries if convenient.",
            "After each imported library, add a comment giving the most recent library version like `// packagename@version`."
        ].join(" ");
        const prompt = [jsCode, instruction, req.body.command, stylePrompt].join("\n");
        stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
            user: userId
        }, {
            headers: {
                // The rate limit is 100/IP address/minute
                "Helicone-Property-IP": req.ip,
                "Helicone-Property-Action": "Transform",
                "Helicone-Property-Instruction": encodeURIComponent(req.body.command),
                "Helicone-RateLimit-Policy": "100;w=60;s=ip"
            }
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }

    // Stream the response back to the client
    if (stream) {
        try {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            const codeStream = new CodeStream(res);
            await codeStream.pushStream(stream);
        } catch (e: any) {
            // If an error occurs after the stream has started:
            res.write(JSON.stringify({
                "type": "error",
                "content": e.message
            }) + "\n");
        }
    }
    res.end();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});