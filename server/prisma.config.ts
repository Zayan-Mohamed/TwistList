import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Force usage of the env var, which must be set in Docker/Railway
    url: process.env.DATABASE_URL!,
  },
});
