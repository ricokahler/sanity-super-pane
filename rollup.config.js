import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

const extensions = ['.js', '.ts', '.tsx'];

const config = {
  input: './super-pane/index.ts',
  output: {
    file: './dist/index.esm.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve({ extensions, modulesOnly: true }),
    babel({
      babelrc: false,
      configFile: false,
      presets: [
        ['@babel/preset-env', { targets: 'defaults and not IE 11' }],
        '@babel/preset-typescript',
        '@babel/preset-react',
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties',
        // for some reason, sanity's webpack config doesn't like spreads
        [
          '@babel/plugin-proposal-object-rest-spread',
          { loose: true, useBuiltIns: true },
        ],
      ],
      babelHelpers: 'runtime',
      extensions,
    }),
    postcss({
      modules: true,
      plugins: [autoprefixer],
    }),
  ],
  external: [
    '@sanity/ui',
    '@sanity/icons',
    'part:@sanity/base/preview',
    'part:@sanity/base/schema',
    'react',
    'classnames',
    'nanoid',
    'react-error-boundary',
    'part:@sanity/base/client',
    'rxjs/operators',
    /^@babel\/runtime/,
  ],
};

export default config;
