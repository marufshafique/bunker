# ─── Stage 1: Build ────────────────────────────────────────────
FROM rust:1.94-slim-bookworm AS builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "" > src/lib.rs
RUN cargo build --release 2>/dev/null || true
RUN rm -rf src

COPY src ./src
COPY .sqlx ./.sqlx
# Docker COPY preserves the source files' original mtimes, which can be older
# than the dummy dependency-cache build above. Touch them so cargo's mtime-based
# fingerprinting rebuilds the real crate instead of reusing the empty stub.
RUN find src -name '*.rs' -exec touch {} +
ENV SQLX_OFFLINE=true
RUN cargo build --release

# Build sqlx-cli for migrations
RUN cargo install sqlx-cli --no-default-features --features postgres,rustls --root /sqlx-cli

# ─── Stage 2: Runtime ──────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/bunker /app/bunker
COPY --from=builder /sqlx-cli/bin/sqlx /usr/local/bin/sqlx
COPY config.docker.yml /app/config.yml
COPY entrypoint.sh /app/entrypoint.sh
COPY migrations /app/migrations

RUN chmod +x /app/entrypoint.sh && mkdir -p /app/uploads

EXPOSE 7000

ENTRYPOINT ["/app/entrypoint.sh"]
