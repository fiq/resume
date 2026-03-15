FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /work

COPY package.json ./
COPY scripts ./scripts

RUN corepack enable && pnpm install --frozen-lockfile=false

CMD ["pnpm", "refresh:cto"]
