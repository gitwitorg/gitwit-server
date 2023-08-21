import express, { Request, Response } from 'express';
import { transformations, transformFiles } from './transform'
import cors from 'cors'
import OpenAI from 'openai';

import dotenv from 'dotenv';
dotenv.config();

// Create an Express application
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Define a route handler for the root path
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

// Define an API endpoint for code transformation
app.post("/transform", async (req: Request, res: Response) => {
    try {
        const modifiedCode = await transformFiles(req.body.files, req.body.transformation, req.body.activeFile);
        res.json(modifiedCode);
    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Define an API endpoint to list available transformations
app.get("/transformations", async (req: Request, res: Response) => {
    try {
        res.json(transformations);
    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const openai = new OpenAI(
    process.env.HELICONE_API_KEY ? {
        baseURL: 'https://oai.hconeai.com/v1',
        defaultHeaders: {
            "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`
        },
        apiKey: process.env.OPENAI_API_KEY
    } : {}
);

app.post('/generate', async (req: Request, res: Response) => {
    if (req.body.userId === undefined) {
        res.status(400).json({ error: "userId is required" });
        return;
    }
    const instruction = "Take the above code and\n" + req.body.command + "\nReturn the complete code with the changes.";
    const prompt = "```javascript\n" + req.body.code + "\n```\n" + instruction;
    const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        user: "cookie:"+req.body.userId
    }, {
        headers: {
          // The rate limit is 100/IP address/minute
          "Helicone-Property-IP": req.ip,
          "Helicone-Property-Action": "Transform",
          "Helicone-Property-Instruction": req.body.command,
          "Helicone-RateLimit-Policy": "100;w=60;s=ip"
        }
    });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    var generatedCode = '';
    for await (const part of stream) {
        const message = part.choices[0]?.delta?.content;
        generatedCode += message;

        if (message !== undefined) {
            res.write(message);
        }
    }
    res.end();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});