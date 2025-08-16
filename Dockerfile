FROM node:lts-slim

# This enables pnpm
RUN corepack enable

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
    
EXPOSE 3000

CMD ["pnpm", "run", "dev"]