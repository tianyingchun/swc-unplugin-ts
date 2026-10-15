# @hyperse/unplugin-swc

## 2.0.0

### Major Changes

- [`a95a02d`](https://github.com/hyperse-io/unplugin-swc/commit/a95a02d9242b415bd282b1f57bb15ec87b1a43ae) Thanks [@tianyingchun](https://github.com/tianyingchun)! - Drop support for Node.js versions below 20.19.

  The `unplugin` dependency was upgraded from v2 to v3, whose lowest supported runtime is Node.js `^20.19.0 || >=22.12.0` (upstream v2 only required `>=18.12.0`). Since `unplugin` is a runtime dependency that is imported by the published entrypoint, the package can no longer be loaded on Node.js 18 or on Node.js 20.x below 20.19.

  `engines.node` is now declared as `^20.19.0 || >=22.12.0`, so package managers will refuse to install rather than letting consumers hit a load-time `TypeError`. If you are on an older runtime, stay on the 1.x line.

  Also includes a set of internal toolchain upgrades with no runtime impact: `@swc/core`, `@changesets/cli`, `@commitlint/*`, `eslint`, `rollup`, `tsup`, `typescript`, `vite` and `vitest`, plus a TypeScript pin and npm publishing via `YARN_NPM_AUTH_TOKEN`.

## 1.0.2

### Patch Changes

- [`5c5680e`](https://github.com/hyperse-io/unplugin-swc/commit/5c5680eec02e7c48999bfab9822d7907d6f79b75) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

## 1.0.1

### Patch Changes

- [`192ae37`](https://github.com/hyperse-io/unplugin-swc/commit/192ae37672f1c0119b260b4c56bbd305e8e853ac) Thanks [@tianyingchun](https://github.com/tianyingchun)! - migrate, bump version
