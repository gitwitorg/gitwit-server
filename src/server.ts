import express, { Request, Response } from 'express';
import { transformFiles } from './transform'
import cors from 'cors'

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
        const modifiedCode = transformFiles(req.body.files, req.body.transformation, req.body.activeFile);
        res.json(modifiedCode);
    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});