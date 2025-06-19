# Use a slim base image for a smaller footprint
FROM python:3.9-slim

# Set a non-root user
RUN addgroup --system appgroup && adduser --system --group --uid 1000 appuser

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Set work directory and permissions
WORKDIR /app

# Copy and install dependencies first (optimizing layer caching)
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements_ping.txt

# Copy application files
COPY pingpong.py /app/

# Change ownership and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Set environment variables
ENV DB_HOST=postgres-service.devops.svc.cluster.local \
    DB_NAME=pingpong \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    DB_PORT=5432

# Expose port and run the application
EXPOSE 5001
CMD ["python", "pingpong.py"]
