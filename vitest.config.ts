import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit specs only. Playwright owns tests/*.spec.ts and must not be picked up here.
    include: ['src/**/*.test.ts'],
  },
});
