# 👑 UNIFIED EXCHANGE PLATFORM - MATCHING ENGINE BUILD
# Stage 1: Builder
FROM rust:1.70-slim-bullseye as builder

WORKDIR /usr/src/matching-engine

# Install build dependencies for rdkafka
RUN apt-get update && apt-get install -y cmake pkg-config libssl-dev build-essential && rm -rf /var/lib/apt/lists/*

# Create empty project to cache dependencies

RUN USER=root cargo new --bin unified-exchange-matching
WORKDIR /usr/src/matching-engine/unified-exchange-matching

# Copy manifests
COPY ./Cargo.toml ./Cargo.lock ./

# Build dependencies (caching)
RUN cargo build --release
RUN rm src/*.rs

# Copy source code
COPY ./src ./src

# Build for release
RUN rm ./target/release/deps/unified_exchange_matching*
RUN cargo build --release

# Stage 2: Runtime
FROM debian:bullseye-slim

# Install runtime dependencies (OpenSSL, etc.)
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/matching-engine/unified-exchange-matching/target/release/unified-exchange-matching /usr/local/bin/matching-engine

# Low latency tuning (requires privileged container in prod)
# RUN echo 0 > /proc/sys/kernel/randomize_va_space

CMD ["matching-engine"]
