# Use an official Node.js runtime as a parent image
FROM node:18.16.1

# Set the working directory in the container to /app
WORKDIR /app

# Copy application to the container
COPY package.json yarn.lock src tsconfig.json /app/

# Install project dependencies
RUN yarn install

# Expose the port on which your ExpressJS server will run (replace 3000 with the actual port)
EXPOSE 3001

# Start the ExpressJS server when the container starts
CMD ["yarn", "start"]