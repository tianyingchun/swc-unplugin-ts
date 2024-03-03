import path from 'path';
import { rollup } from 'rollup';
import { expect, test } from 'vitest';
import { swcUnpluginTs } from '../dist';

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
  expect(output[0].code).toMatchSnapshot();
});

test('read tsconfig', async () => {
  const bundle = await rollup({
    input: fixture('read-tsconfig/index.tsx'),
    plugins: [swcUnpluginTs.rollup({})],
  });

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('read-tsconfig/dist'),
  });

  const code = output[0].code;
  expect(code).toMatch('customJsxFactory');

  // NOTE: use tsconfig.base.json which experimentalDecorators turned off will throw
  expect(
    rollup({
      input: fixture('read-tsconfig/index.tsx'),
      plugins: [swcUnpluginTs.rollup({ tsconfigFile: 'tsconfig.base.json' })],
    })
  ).rejects.toThrow('Syntax Error');
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
  expect(code).toMatch('customPragma');
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
  expect(code).toMatchSnapshot();
});
