# 👑 UNIFIED EXCHANGE PLATFORM - QUANT STUDIO SANDBOX
# Security: Network Isolated, Resource Capped, Non-Root
# Base Image: Minimal Python Slim

FROM python:3.11-slim

# 1. Security Hardening: Create non-root user
RUN useradd -m -d /sandbox -s /bin/bash quant_user

# 2. Install Scientific Libraries (Pre-approved list only)
RUN pip install --no-cache-dir numpy pandas scipy scikit-learn

# 3. Network Isolation (Software Level)
# Note: Docker network=none should be used at runtime, but we remove networking tools just in case.
RUN apt-get update && apt-get remove -y curl wget netcat-openbsd && apt-get clean

# 4. Set Working Directory & Permissions
WORKDIR /sandbox
COPY sandbox_runner.py .
RUN chown -R quant_user:quant_user /sandbox

# 5. Switch to Non-Root User
USER quant_user

# 6. Resource Limits (Enforced by Runtime, but documented here)
# CPU: 0.5 Core
# RAM: 512MB
# Network: None

ENTRYPOINT ["python", "sandbox_runner.py"]
