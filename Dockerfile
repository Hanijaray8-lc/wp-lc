
# Use the official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
