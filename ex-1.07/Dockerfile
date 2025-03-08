# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the Python script into the container
COPY random_string_generator.py .

# Run the Python script when the container starts
ENTRYPOINT ["python", "random_string_generator.py"]