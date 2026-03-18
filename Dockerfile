FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /work

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
  && corepack prepare pnpm@10.7.0 --activate \
  && pnpm install --frozen-lockfile

COPY scripts ./scripts

CMD ["pnpm", "refresh:all"]
