import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite({ jsc: { parser: { syntax: 'typescript', decorators: true }, transform: { legacyDecorator: true, decoratorMetadata: true } } })],
  test: { include: ['test/**/*.test.ts'], fileParallelism: false, hookTimeout: 60000, testTimeout: 15000 },
});
