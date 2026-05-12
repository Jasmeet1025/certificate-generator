# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install LibreOffice and other dependencies for PDF conversion
RUN apt-get update && apt-get install -y \
    libreoffice \
    libxrender1 \
    libxext6 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Streamlit runs on
EXPOSE 8080

# Command to run the app
CMD ["streamlit", "run", "web_app.py", "--server.port=8080", "--server.address=0.0.0.0"]