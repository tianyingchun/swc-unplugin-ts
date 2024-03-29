import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: {
    resolve: true,
  },
});
