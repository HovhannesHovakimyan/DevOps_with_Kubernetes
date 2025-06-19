#!/bin/bash

# Get the name of the containing folder (parent directory of the script)
CONTAINING_FOLDER=$(basename "$(pwd)")
# Remove "ex-" prefix if present
CONTAINING_FOLDER=${CONTAINING_FOLDER#ex-}
DOCKER_HUB_USERNAME="hovhanneshovakimyan"

# Define image names using the containing folder name
PINGPONG_APP="${DOCKER_HUB_USERNAME}/ping-pong:${CONTAINING_FOLDER}"
LOG_OUTPUT_APP="${DOCKER_HUB_USERNAME}/random-string-generator:${CONTAINING_FOLDER}"

# Define directory paths
PINGPONG_DIR="pingpong-app"
LOG_OUTPUT_DIR="log-output-app"

# Build the ping pong Docker image
echo "Building ping pong image: $PINGPONG_APP"
cd "$PINGPONG_DIR" || { echo "Failed to enter $PINGPONG_DIR directory"; exit 1; }
docker build -t "$PINGPONG_APP" .
cd .. || { echo "Failed to return to root directory"; exit 1; }

# Build the log output Docker image
echo "Building log output image: $LOG_OUTPUT_APP"
cd "$LOG_OUTPUT_DIR" || { echo "Failed to enter $LOG_OUTPUT_DIR directory"; exit 1; }
docker build -t "$LOG_OUTPUT_APP" .
cd .. || { echo "Failed to return to root directory"; exit 1; }

# Push the images to DockerHub
echo "Pushing images to DockerHub..."
cd "$PINGPONG_DIR" || { echo "Failed to enter $PINGPONG_DIR directory"; exit 1; }
docker push "$PINGPONG_APP" || { echo "Failed to push ping pong image"; exit 1; }
cd "$LOG_OUTPUT_DIR" || { echo "Failed to enter $LOG_OUTPUT_DIR directory"; exit 1; }
docker push "$LOG_OUTPUT_APP" || { echo "Failed to push log output image"; exit 1; }

echo "Successfully built and pushed images:"
echo "- $PINGPONG_APP"
echo "- $LOG_OUTPUT_APP"