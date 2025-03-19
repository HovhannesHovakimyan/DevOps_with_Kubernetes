#!/bin/sh

# Trap SIGINT (Ctrl+C) and SIGTERM to stop the Node.js process gracefully
trap 'echo "Stopping..."; kill -INT $PID; wait $PID' INT TERM

# Start the application
npm start &

# Get the process ID of the npm start command
PID=$!

# Wait for the process to finish
wait $PID