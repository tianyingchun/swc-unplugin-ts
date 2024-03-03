import path from 'path';
import { defu } from 'defu';
import { createUnplugin } from 'unplugin';
import { FilterPattern, createFilter } from '@rollup/pluginutils';
import { loadTsConfig } from 'load-tsconfig';
import {
  JscConfig,
  Options as SwcOptions,
  TransformConfig,
  transform,
} from '@swc/core';
import { resolveId } from './resolve.js';

export type UnpluginSwcOptions = SwcOptions & {
  include?: FilterPattern;
  exclude?: FilterPattern;
  tsconfigFile?: string | boolean;
};

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

type SWCOptions = WithRequiredProperty<JscConfig, 'parser' | 'transform'>;

export const swcUnpluginTs = createUnplugin(
  ({
    tsconfigFile,
    minify,
    include,
    exclude,
    ...options
  }: UnpluginSwcOptions = {}) => {
    const filter = createFilter(
      include || /\.[jt]sx?$/,
      exclude || /node_modules/
    );

    return {
      name: 'swc',

      resolveId,

      async transform(code, id) {
        if (!filter(id)) return null;

        const compilerOptions =
          tsconfigFile === false
            ? {}
            : loadTsConfig(
                path.dirname(id),
                tsconfigFile === true ? undefined : tsconfigFile
              )?.data?.compilerOptions || {};

        const isTs = /\.tsx?$/.test(id);

        let jsc: SWCOptions = {
          parser: {
            syntax: isTs ? 'typescript' : 'ecmascript',
          },
          transform: {},
        };

        if (compilerOptions.jsx) {
          Object.assign(jsc.parser || {}, {
            [isTs ? 'tsx' : 'jsx']: true,
          });
          Object.assign<TransformConfig, TransformConfig>(jsc.transform || {}, {
            react: {
              pragma: compilerOptions.jsxFactory,
              pragmaFrag: compilerOptions.jsxFragmentFactory,
              importSource: compilerOptions.jsxImportSource,
            },
          });
        }

        // https://github.com/vendure-ecommerce/vendure/issues/2099
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier
        Object.assign(jsc.transform || {}, {
          useDefineForClassFields:
            compilerOptions.useDefineForClassFields || false,
        });

        if (compilerOptions.experimentalDecorators) {
          // class name is required by type-graphql to generate correct graphql type
          jsc.keepClassNames = true;
          Object.assign(jsc.parser || {}, {
            decorators: true,
          });
          Object.assign<TransformConfig, TransformConfig>(jsc.transform || {}, {
            legacyDecorator: true,
            decoratorMetadata: compilerOptions.emitDecoratorMetadata,
          });
        }

        if (compilerOptions.target) {
          jsc.target = compilerOptions.target;
        }

        if (options.jsc) {
          jsc = defu<SWCOptions, SWCOptions[]>(options.jsc, jsc);
        }

        const result = await transform(code, {
          filename: id,
          sourceMaps: true,
          ...options,
          jsc,
        });
        return {
          code: result.code,
          map: result.map && JSON.parse(result.map),
        };
      },

      vite: {
        config() {
          return {
            esbuild: false,
          };
        },
      },

      rollup: {
        async renderChunk(code, chunk) {
          if (minify) {
            const result = await transform(code, {
              sourceMaps: true,
              minify: true,
              filename: chunk.fileName,
            });
            return {
              code: result.code,
              map: result.map,
            };
          }
          return null;
        },
      },
    };
  }
);
