// src/index.ts
import path from "path";
import { createFilter } from "@rollup/pluginutils";
import {
  transform
} from "@swc/core";
import { defu } from "defu";
import { loadTsConfig } from "load-tsconfig";
import { createUnplugin } from "unplugin";

// src/resolve.ts
import fs from "fs";
import { dirname, join, resolve } from "path";
import { pathExists } from "path-exists";
var RESOLVE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"];
var resolveFile = async (resolved, index = false) => {
  for (const ext of RESOLVE_EXTENSIONS) {
    const file = index ? join(resolved, `index${ext}`) : `${resolved}${ext}`;
    if (await pathExists(file))
      return file;
  }
};
var resolveId = async (importee, importer) => {
  if (importer && importee[0] === ".") {
    const absolutePath = resolve(
      importer ? dirname(importer) : process.cwd(),
      importee
    );
    let resolved = await resolveFile(absolutePath);
    if (!resolved && await pathExists(absolutePath) && await fs.promises.stat(absolutePath).then((stat) => stat.isDirectory())) {
      resolved = await resolveFile(absolutePath, true);
    }
    return resolved;
  }
};

// src/index.ts
var swcUnpluginTs = createUnplugin(
  ({
    tsconfigFile,
    minify,
    include,
    exclude,
    ...options
  } = {}) => {
    const filter = createFilter(
      include || /\.[jt]sx?$/,
      exclude || /node_modules/
    );
    return {
      name: "swc",
      resolveId,
      async transform(code, id) {
        if (!filter(id))
          return null;
        const compilerOptions = tsconfigFile === false ? {} : loadTsConfig(
          path.dirname(id),
          tsconfigFile === true ? void 0 : tsconfigFile
        )?.data?.compilerOptions || {};
        const isTs = /\.tsx?$/.test(id);
        let jsc = {
          parser: {
            syntax: isTs ? "typescript" : "ecmascript"
          },
          transform: {}
        };
        if (compilerOptions.jsx) {
          Object.assign(jsc.parser || {}, {
            [isTs ? "tsx" : "jsx"]: true
          });
          Object.assign(jsc.transform || {}, {
            react: {
              pragma: compilerOptions.jsxFactory,
              pragmaFrag: compilerOptions.jsxFragmentFactory,
              importSource: compilerOptions.jsxImportSource
            }
          });
        }
        Object.assign(jsc.transform || {}, {
          useDefineForClassFields: compilerOptions.useDefineForClassFields || false
        });
        if (compilerOptions.experimentalDecorators) {
          jsc.keepClassNames = true;
          Object.assign(jsc.parser || {}, {
            decorators: true
          });
          Object.assign(jsc.transform || {}, {
            legacyDecorator: true,
            decoratorMetadata: compilerOptions.emitDecoratorMetadata
          });
        }
        if (compilerOptions.target) {
          jsc.target = compilerOptions.target;
        }
        if (options.jsc) {
          jsc = defu(options.jsc, jsc);
        }
        const result = await transform(code, {
          filename: id,
          sourceMaps: true,
          ...options,
          jsc
        });
        return {
          code: result.code,
          map: result.map && JSON.parse(result.map)
        };
      },
      vite: {
        config() {
          return {
            esbuild: false
          };
        }
      },
      rollup: {
        async renderChunk(code, chunk) {
          if (minify) {
            const result = await transform(code, {
              sourceMaps: true,
              minify: true,
              filename: chunk.fileName
            });
            return {
              code: result.code,
              map: result.map
            };
          }
          return null;
        }
      }
    };
  }
);
export {
  swcUnpluginTs
};
//# sourceMappingURL=index.js.map