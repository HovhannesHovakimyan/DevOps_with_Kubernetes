#!/bin/bash

# Get the name of the containing folder (parent directory of the script)
CONTAINING_FOLDER=$(basename "$(pwd)")

# Define image names using the containing folder name
BACKEND_IMAGE="hovhanneshovakimyan/k8sproject:${CONTAINING_FOLDER}-backend"
FRONTEND_IMAGE="hovhanneshovakimyan/k8sproject:${CONTAINING_FOLDER}-frontend"

# Build the backend Docker image
echo "Building backend image: $BACKEND_IMAGE"
cd backend || { echo "Failed to enter backend directory"; exit 1; }
docker build -t "$BACKEND_IMAGE" .
cd .. || { echo "Failed to return to root directory"; exit 1; }

# Build the frontend Docker image
echo "Building frontend image: $FRONTEND_IMAGE"
cd frontend || { echo "Failed to enter frontend directory"; exit 1; }
docker build -t "$FRONTEND_IMAGE" .
cd .. || { echo "Failed to return to root directory"; exit 1; }

# Push the images to DockerHub
echo "Pushing images to DockerHub..."
docker push "$BACKEND_IMAGE" || { echo "Failed to push backend image"; exit 1; }
docker push "$FRONTEND_IMAGE" || { echo "Failed to push frontend image"; exit 1; }

echo "Successfully built and pushed images:"
echo "- $BACKEND_IMAGE"
echo "- $FRONTEND_IMAGE"