/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    bail: 1,
    testTimeout: 10000,
    include: [
      "./tests/unit/*.ts"
    ]
  },
});
