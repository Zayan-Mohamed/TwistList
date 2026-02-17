FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN pnpm install --frozen-lockfile

COPY . .

# Generate Prisma Client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm dlx prisma generate

# Build the application
RUN echo "Starting NestJS build..." && \
    pnpm run build && \
    echo "Build completed successfully!" && \
    ls -la dist/ && \
    echo "Main file exists:" && \
    ls -la dist/src/main.js

EXPOSE 8000

CMD [ "pnpm", "run", "start:prod" ]
