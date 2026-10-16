
FROM node:22-bookworm-slim

# Install Python, virtual environment support, FFmpeg, and certificates.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 \
       python3-venv \
       ffmpeg \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp in an isolated Python environment.
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir --upgrade pip yt-dlp

# Make the virtual environment's Python available to the application.
ENV PATH="/opt/venv/bin:${PATH}"
ENV NODE_ENV=production

WORKDIR /app

# Install Node dependencies.
COPY package*.json ./
RUN npm install --omit=dev

# Copy the backend source.
COPY src ./src

# Render supplies the PORT environment variable.
EXPOSE 10000

CMD ["npm", "start"]
