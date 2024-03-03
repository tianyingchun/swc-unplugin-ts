import * as unplugin from 'unplugin';
import { FilterPattern } from '@rollup/pluginutils';
import { Options } from '@swc/core';

type UnpluginSwcOptions = Options & {
    include?: FilterPattern;
    exclude?: FilterPattern;
    tsconfigFile?: string | boolean;
};
declare const swcUnpluginTs: unplugin.UnpluginInstance<UnpluginSwcOptions, boolean>;

export { type UnpluginSwcOptions, swcUnpluginTs };
