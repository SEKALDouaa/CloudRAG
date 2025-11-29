# Stage 1: Build the frontend
FROM node:20 AS builder

# Set working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build the backend and serve the frontend
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies required by opencv-python
RUN apt-get update && apt-get install -y libgl1

# Install dependencies
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY app/ ./app/
COPY run.py .

# Copy the built frontend from the builder stage
COPY --from=builder /app/frontend/dist ./app/build

# Expose the port the app runs on
EXPOSE 5000

# WARNING: This is a default, insecure key for development purposes only.
# You MUST override this environment variable with a strong, secret key in production.
ENV JWT_SECRET_KEY=change-this-in-production

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"] 
