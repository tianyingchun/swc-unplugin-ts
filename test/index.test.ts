import { test } from 'uvu';
import assert from 'uvu/assert';
import path from 'path';
import { swcUnpluginTs } from '../dist/index.js';
import { rollup } from 'rollup';

const fixture = (...args: string[]) =>
  path.join(__dirname, 'fixtures', ...args);

test('rollup', async () => {
  const bundle = await rollup({
    input: fixture('rollup/index.ts'),
    plugins: [
      swcUnpluginTs.rollup({
        tsconfigFile: false,
      }),
    ],
  });

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('rollup/dist'),
  });
  assert.match(output[0].code, `'use strict';`);
  assert.match(output[0].code, `var foo = "foo";`);
  assert.match(output[0].code, `exports.foo = foo;`);
});

test('read tsconfig', async () => {
  const bundle = await rollup({
    input: fixture('read-tsconfig/index.tsx'),
    plugins: [swcUnpluginTs.rollup()],
  });

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('read-tsconfig/dist'),
  });

  const code = output[0].code;
  assert.match(code, 'customJsxFactory');

  // NOTE: use tsconfig.base.json which experimentalDecorators turned off will throw
  await rollup({
    input: fixture('read-tsconfig/index.tsx'),
    plugins: [swcUnpluginTs.rollup({ tsconfigFile: 'tsconfig.base.json' })],
  }).catch((e) => {
    return assert.match(e.toString(), ' @sealed');
  });

  const result = await rollup({
    input: fixture('read-tsconfig/index.tsx'),
    plugins: [swcUnpluginTs.rollup({ tsconfigFile: 'tsconfig.json' })],
  });
  const { output: output1 } = await result.generate({
    format: 'cjs',
  });
  assert.match(output1[0].code, 'exports.BugReport = __decorate([');
});

test('custom swcrc', async () => {
  const bundle = await rollup({
    input: fixture('custom-swcrc/index.tsx'),
    plugins: [
      swcUnpluginTs.rollup({
        tsconfigFile: false,
      }),
    ],
  });

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('custom-swcrc/dist'),
  });

  const code = output[0].code;
  assert.match(code, 'customPragma');
});

test('minify', async () => {
  const bundle = await rollup({
    input: fixture('minify/index.ts'),
    plugins: [
      swcUnpluginTs.rollup({
        minify: true,
      }),
    ],
  });

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('minify/dist'),
  });

  const code = output[0].code;
  console.log(code);
  assert.match(
    code,
    `var Foo=function Foo(){_classCallCheck(this,Foo);this.a=1}`
  );
});

test.run();
