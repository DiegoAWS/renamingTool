import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

const extensions = ['.js'];

const preventTreeShakingPlugin = () => {
    return {
        name: 'no-treeshaking',
        resolveId(id, importer) {
            if (!importer) {
                // let's not treeshake entry points, as we're not exporting anything in App Scripts
                return { id, moduleSideEffects: 'no-treeshake' };
            }
            return null;
        },
    };
};

export default {
    input: './src/index.js',
    output: {
        dir: 'dist',
        format: 'cjs',
    },
    plugins: [
        preventTreeShakingPlugin(),
        nodeResolve({
            extensions,
            mainFields: ['jsnext:main', 'main'],
        }),
        babel({ extensions, babelHelpers: 'runtime', exclude: '**/node_modules/**' }),
        copy({
            targets: [
                { src: 'src/templates/*', dest: 'dist' },
                { src: 'appsscript.json', dest: 'dist' },
            ],
            verbose: true,
        }),
    ],
};
