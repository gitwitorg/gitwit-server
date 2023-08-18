import express, { Request, Response } from 'express';
import { transformations, transformFiles } from './transform'
import cors from 'cors'
import OpenAI from 'openai';

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

const openai = new OpenAI({});

app.post('/generate', async (req: Request, res: Response) => {
    const instruction = "Take the above code and\n" + req.body.command + "\nReturn the complete code with the changes.";
    const prompt = "```javascript\n" + req.body.code + "\n```\n" + instruction;
    const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        stream: true
    });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    var generatedCode = '';
    for await (const part of stream) {
        const message = part.choices[0]?.delta?.content;
        generatedCode += message;

        if (message !== undefined) {
            const fences = generatedCode.split('```').length-1;
            const codeBlockStarted = fences % 2 === 1;
            if (codeBlockStarted) {
                res.write(message);
            }
            if (fences >= 2) {
                break;
            }
        }
    }
    res.end();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});