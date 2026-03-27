#!/bin/bash

# -----------------------------------------------------------------------------
# Script: build-and-push.sh
# Description:
#   Builds and pushes two Docker images (ping-pong and log-output) for both
#   amd64 and arm64 architectures using Docker Buildx. The images are tagged
#   with the current folder version and pushed to Docker Hub under the specified
#   username. The script automatically creates and uses a Buildx builder if
#   needed.
#
#   - Builds pingpong-app and log-output-app from their respective directories.
#   - Tags images as <DOCKER_HUB_USERNAME>/ping-pong:<version>-multiarch and
#     <DOCKER_HUB_USERNAME>/random-string-generator:<version>-multiarch.
#   - Pushes multi-arch images to Docker Hub.
#
# Usage:
#   ./build-and-push.sh
# -----------------------------------------------------------------------------
#!/bin/bash

# Get the name of the containing folder (parent directory of the script)
CONTAINING_FOLDER=$(basename "$(pwd)")
# Remove "ex-" prefix if present
CONTAINING_FOLDER=${CONTAINING_FOLDER#ex-}
DOCKER_HUB_USERNAME="hovhanneshovakimyan"

# Define image names using the containing folder name and add -multiarch suffix
PINGPONG_APP="${DOCKER_HUB_USERNAME}/ping-pong:${CONTAINING_FOLDER}-multiarch"
LOG_OUTPUT_APP="${DOCKER_HUB_USERNAME}/random-string-generator:${CONTAINING_FOLDER}-multiarch"

# Define directory paths
PINGPONG_DIR="pingpong-app"
LOG_OUTPUT_DIR="log-output-app"

# Ensure buildx is available
docker buildx version > /dev/null 2>&1 || { echo "docker buildx is not installed."; exit 1; }

# Create a builder if it doesn't exist
if ! docker buildx inspect multiarch-builder > /dev/null 2>&1; then
	docker buildx create --name multiarch-builder --use
else
	docker buildx use multiarch-builder
fi

# Build and push the ping pong Docker image for amd64 and arm64
echo "Building and pushing multi-arch ping pong image: $PINGPONG_APP"
cd "$PINGPONG_DIR" || { echo "Failed to enter $PINGPONG_DIR directory"; exit 1; }
docker buildx build --platform linux/amd64,linux/arm64 -t "$PINGPONG_APP" --push .
cd .. || { echo "Failed to return to root directory"; exit 1; }

# Build and push the log output Docker image for amd64 and arm64
echo "Building and pushing multi-arch log output image: $LOG_OUTPUT_APP"
cd "$LOG_OUTPUT_DIR" || { echo "Failed to enter $LOG_OUTPUT_DIR directory"; exit 1; }
docker buildx build --platform linux/amd64,linux/arm64 -t "$LOG_OUTPUT_APP" --push .
cd .. || { echo "Failed to return to root directory"; exit 1; }

echo "Successfully built and pushed multi-arch images:"
echo "- $PINGPONG_APP"
echo "- $LOG_OUTPUT_APP"