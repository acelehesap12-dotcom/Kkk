# 👑 RISK ENGINE DOCKERFILE
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scientific packages if needed
# RUN apt-get update && apt-get install -y gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src

# Create non-root user
RUN useradd -m risk_user
USER risk_user

CMD ["python", "src/liquidation_waterfall.py"]
