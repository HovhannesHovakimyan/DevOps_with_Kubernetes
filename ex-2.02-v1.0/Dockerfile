# Use an official Node.js 18 runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Define an entrypoint script to handle graceful shutdown
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy and install dependencies first (optimizing layer caching)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy the server.js file and any other necessary files
COPY server.js ./

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV PORT=3000

# Set the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]