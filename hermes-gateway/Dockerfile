FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    NODE_VERSION=20.18.0 \
    PATH=/usr/local/node/bin:$PATH

WORKDIR /app

# -------- system deps --------
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl ca-certificates xz-utils \
        ffmpeg \
        # Remotion / Chromium runtime needs
        libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
        libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
        libasound2 libatspi2.0-0 libgtk-3-0 fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# -------- node 20 --------
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o /tmp/node.tar.xz \
    && mkdir -p /usr/local/node \
    && tar -xJf /tmp/node.tar.xz -C /usr/local/node --strip-components=1 \
    && rm /tmp/node.tar.xz \
    && node --version && npm --version

# -------- python deps --------
COPY pyproject.toml ./
RUN pip install --no-cache-dir \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.32.0" \
    "httpx>=0.27.0" \
    "pydantic>=2.9.0" \
    "pydantic-settings>=2.5.0" \
    "python-dotenv>=1.0.0" \
    "pyjwt>=2.9.0" \
    "sse-starlette>=2.1.3" \
    "supabase>=2.9.0" \
    "tenacity>=9.0.0"

# -------- remotion bundle --------
COPY remotion ./remotion
COPY remotion-package.json ./remotion/package.json
RUN cd remotion && npm install --omit=dev && \
    npx remotion versions || true

# Pre-fetch Chromium so the first render isn't slow
RUN cd remotion && npx remotion browser ensure || true

# -------- app source --------
COPY src ./src

# Make sure render workdir exists
RUN mkdir -p /tmp/channel-os-renders

ENV RENDER_REMOTION_ENTRY=/app/remotion/Root.tsx

EXPOSE 8088

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8088/healthz || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8088"]
