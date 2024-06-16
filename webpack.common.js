const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const views = ['background', 'settings', 'popup'];
const integrations = [
  'ttu',
  'anacreon',
  'mokuro',
  'asbplayer',
  'readwok',
  'wikipedia',
  'youtube',
  'bunpro',
];

module.exports = {
  async config(env) {
    return {
      mode: env,
      entry: {
        ...views.reduce(
          (acc, view) =>
            Object.assign(acc, {
              [`views/${view}`]: {
                import: `./src/views/${view}/${view}.js`,
              },
            }),
          {},
        ),
        ...integrations.reduce(
          (acc, integration) =>
            Object.assign(acc, {
              [`integrations/${integration}`]: {
                import: `./src/integrations/${integration}.js`,
              },
            }),
          {},
        ),
        // 'service-worker': {
        //   import: './src/service-worker.ts',
        //   runtime: false,
        // },
        // ...contentScripts.reduce(
        //   (acc, contentScript) =>
        //     Object.assign(acc, {
        //       [`apps/${contentScript}`]: {
        //         import: `./src/apps/${contentScript}.ts`,
        //         runtime: false,
        //       },
        //     }),
        //   {},
        // ),
        theme: './src/styles/theme.scss',
        common: './src/styles/common.scss',
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        extensionAlias: {
          '.ts': ['.js', '.ts'],
          '.cts': ['.cjs', '.cts'],
          '.mts': ['.mjs', '.mts'],
        },
        // alias: {
        //   '@apps': path.resolve(__dirname, 'src/apps'),
        //   '@components': path.resolve(__dirname, 'src/components'),
        //   '@lib': path.resolve(__dirname, 'src/lib'),
        //   '@styles': path.resolve(__dirname, 'src/styles'),
        // },
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            { from: 'assets', to: 'assets' },
            { from: 'manifest.json', to: 'manifest.json' },
          ],
        }),
        // new DefinePlugin({
        //   __VERSION__: JSON.stringify(version),
        //   __ENV__: JSON.stringify(),
        //   __PRODUCTION__: JSON.stringify(env === 'production'),
        //   __DEVELOPMENT__: JSON.stringify(env === 'development'),
        // }),
        ...views.map(
          (view) =>
            new HtmlWebpackPlugin({
              filename: `views/${view}.html`,
              template: `src/views/${view}/${view}.html`,
              chunks: ['theme', 'common', `views/${view}`],
            }),
        ),
      ],
      module: {
        rules: [
          {
            test: /\.(scss)$/,
            include: [path.resolve(__dirname, 'src/styles'), path.resolve(__dirname, 'src/views')],
            use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
          },
          //   {
          //     test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,
          //     type: 'asset/resource',
          //   },
          //   {
          //     test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
          //     type: 'asset/resource',
          //   },
          {
            test: /.([cm]?ts|tsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
      output: {
        // filename: 'runtime/[name].js',
        path: path.resolve(__dirname, 'anki-jpdb.reader'),
        clean: true,
      },
    };
  },
};
