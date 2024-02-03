# GitWit Codegen Server

This is an ExpressJS server with an API endpoint to make changes to code files while streaming the results.

## Prerequisites

Before running the server, ensure you have the following prerequisites installed on your system:

- [Node.js](https://nodejs.org/) 18.16.1 or compatible version
- [Yarn](https://classic.yarnpkg.com/en/docs/install/) for managing dependencies

## Environment Variables

Before running the server, you need to set the following environment variables:

- `OPENAI_API_KEY`: (Required) Your OpenAI API key
- `HELICONE_API_KEY`: (Optional) Your Helicone API key
- `CLERK_API_KEY`: (Required) Your Clerk API key

## Usage as a server

To use, first install dependencies:

`yarn install`

To run in production mode:

`yarn start`

To run in development mode:

`yarn dev`

## Usage as a library

First, install gitwit-server in your project using `yarn link`.

Then, usage is as follows:
```typescript
import { generateCode } from "gitwit-server";
const { code: newAppDotJS, dependencies } = await generateCode(
  appDotJS,
  prompt
);
```

This is mainly useful for running evaluations.

## Docker

To run with Docker:

`docker build -t gitwit-server .`

`docker run -d -p 3001:3001 --env-file .env gitwit-server`
