
#!/bin/bash

# ------------------------------------------------------------------------------
# build-and-push.sh
#
# This script builds and pushes multi-architecture (amd64 and arm64) Docker images
# for both backend and frontend services using Docker Buildx. The images are tagged
# with the current directory name and a -multiarch suffix, and are pushed to Docker Hub.
#
# Usage:
#   ./build-and-push.sh
#
# Requirements:
#   - Docker with Buildx enabled
#   - Docker Hub login (docker login)
#   - The script should be run from the project root containing 'backend' and 'frontend' directories
#
# The resulting images will be named:
#   <DOCKER_HUB_USERNAME>/k8sproject:<folder>-backend-multiarch
#   <DOCKER_HUB_USERNAME>/k8sproject:<folder>-frontend-multiarch
# ------------------------------------------------------------------------------

# Get the name of the containing folder (parent directory of the script)
CONTAINING_FOLDER=$(basename "$(pwd)")
DOCKER_HUB_USERNAME="hovhanneshovakimyan"

# Define image names using the containing folder name, with -multiarch suffix
BACKEND_IMAGE="${DOCKER_HUB_USERNAME}/k8sproject:${CONTAINING_FOLDER}-backend-multiarch"
FRONTEND_IMAGE="${DOCKER_HUB_USERNAME}/k8sproject:${CONTAINING_FOLDER}-frontend-multiarch"


# Ensure buildx is available
if ! docker buildx version >/dev/null 2>&1; then
	echo "docker buildx is not available. Please install Docker Buildx." >&2
	exit 1
fi


# Use buildx to build and push multi-arch backend image
echo "Building and pushing multi-arch backend image with buildx: $BACKEND_IMAGE"
docker buildx build --platform linux/amd64,linux/arm64 --push -t "$BACKEND_IMAGE" ./backend || { echo "Failed to build and push backend image"; exit 1; }

# Use buildx to build and push multi-arch frontend image
echo "Building and pushing multi-arch frontend image with buildx: $FRONTEND_IMAGE"
docker buildx build --platform linux/amd64,linux/arm64 --push -t "$FRONTEND_IMAGE" ./frontend || { echo "Failed to build and push frontend image"; exit 1; }

echo "Successfully built and pushed images:"
echo "- $BACKEND_IMAGE"
echo "- $FRONTEND_IMAGE"