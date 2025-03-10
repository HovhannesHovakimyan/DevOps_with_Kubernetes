# Use a slim base image for a smaller footprint
FROM python:3.9-slim

# Set a non-root user
RUN addgroup --system appgroup && adduser --system --group --uid 1000 appuser

# Set work directory and permissions
WORKDIR /app

# Copy and install dependencies first (optimizing layer caching)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py /app/

# Change ownership and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port and run the application
EXPOSE 5000
CMD ["python", "app.py"]
