FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY api api
COPY data data

ENV PORT=3001
EXPOSE 3001

CMD ["uv", "run", "--no-sync", "python", "-m", "api.server"]
