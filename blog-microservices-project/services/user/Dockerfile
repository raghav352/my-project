# services/user/Dockerfile
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the entire application code
COPY . .

# Expose the internal container port
EXPOSE 3001 

# Command to run the application
CMD [ "node", "server.js" ]