import express, { Application, Request, Response } from "express";
import cors from "cors";

import { dependenciesFromCode, streamCodeGeneration } from "./index";

import {
  ClerkExpressWithAuth,
  WithAuthProp,
  LooseAuthProp,
} from "@clerk/clerk-sdk-node";

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
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// Define a route handler for the API endpoint
app.post("/generate", async (req: WithAuthProp<Request>, res: Response) => {
  if ((req.auth.userId || req.body.userId) == undefined) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  // If the user is logged in, use their Clerk ID, otherwise use a cookie
  const userId = req.auth.userId
    ? req.auth.userId
    : `cookie:${req.body.userId}`;

  let headersSent = false;
  await streamCodeGeneration({
    inputCode: req.body.code,
    command: req.body.command,
    userId,
    writeChunk: (data) => {
      if (!headersSent)
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
      headersSent = true;
      res.write(JSON.stringify(data) + "\n");
    },
    errorHandler: (e) => {
      if (headersSent) {
        res.write(
          JSON.stringify({
            type: "error",
            content: e.message,
          }) + "\n"
        );
      } else {
        res.status(500).json({ error: e.message });
      }
    },
    chatHeaders: {
      // The rate limit is 100/IP address/minute
      "Helicone-Property-IP": req.ip,
      "Helicone-Property-Action": "Transform",
      "Helicone-Property-Instruction": encodeURIComponent(req.body.command),
      "Helicone-RateLimit-Policy": "100;w=60;s=ip",
    },
  });

  res.end();
});

app.post("/dependencies", async (req: WithAuthProp<Request>, res: Response) => {
  if ((req.auth.userId || req.body.userId) == undefined) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  res.write(JSON.stringify(dependenciesFromCode(req.body.code)));
  res.end();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
