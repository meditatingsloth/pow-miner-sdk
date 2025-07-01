import { defineConfig, Options } from 'tsup';

const SHARED_OPTIONS: Options = {
  define: { __VERSION__: `"0.0.2"` },
  entry: ['./src/index.ts', './src/hashWorker.ts'],
  outDir: './dist/src',
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.js' : '.mjs' }),
  sourcemap: true,
  treeshake: true,
  external: ['@pow-miner-sdk/hash-wasm/hash_wasm_bg.wasm'],
};

export default defineConfig(() => [
  // Source.
  { ...SHARED_OPTIONS, format: 'cjs' },
  { ...SHARED_OPTIONS, format: 'esm' },

  // Tests.
  {
    ...SHARED_OPTIONS,
    bundle: false,
    entry: ['./test/**/*.ts'],
    format: 'cjs',
    outDir: './dist/test',
  },
]);
