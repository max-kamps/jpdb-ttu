const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const sites = ['settings', 'popup'];
const apps = [
  // 'ttu',
  // 'anacreon',
  // 'mokuro',
  // 'asbplayer',
  // 'readwok',
  // 'wikipedia',
  // 'youtube',
  // 'bunpro',
];
const integrations = ['toast'];
const globalStyles = ['toast', 'word'];

module.exports = {
  async config(env) {
    return {
      mode: env,
      resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        extensionAlias: {
          '.ts': ['.js', '.ts'],
          '.cts': ['.cjs', '.cts'],
          '.mts': ['.mjs', '.mts'],
        },
        alias: {
          '@lib': path.resolve(__dirname, 'src/lib'),
          '@styles': path.resolve(__dirname, 'src/styles'),
        },
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            { from: 'assets', to: 'assets' },
            { from: 'manifest.json', to: 'manifest.json' },
          ],
        }),
        new HtmlBundlerPlugin({
          entry: [
            {
              filename: 'service-worker/service-worker.js',
              import: './src/service-worker/service-worker.ts',
            },
            ...sites.map((site) => ({
              filename: `sites/${site}/${site}.html`,
              import: `src/sites/${site}/${site}.html`,
            })),
            ...apps.map((app) => ({
              filename: `apps/${app}.js`,
              import: `./src/apps/${app}.ts`,
            })),
            ...integrations.map((integration) => ({
              filename: `integrations/${integration}.js`,
              import: `./src/integrations/${integration}.ts`,
            })),
            ...globalStyles.map((style) => ({
              filename: `styles/${style}.css`,
              import: `./src/styles/${style}.scss`,
            })),
          ],
          js: {
            filename: (source) => {
              const root = path.relative(
                path.join(__dirname, 'src'),
                path.dirname(source.filename),
              );

              return path.join(root, '[name].js');
            },
          },
          css: {
            filename: (source) => {
              const root = path.relative(
                path.join(__dirname, 'src'),
                path.dirname(source.filename),
              );

              return path.join(root, '[name].css');
            },
          },
        }),
      ],
      module: {
        rules: [
          {
            test: /\.(css|sass|scss)$/,
            use: ['css-loader', 'sass-loader'],
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,
            type: 'asset/resource',
            generator: {
              filename: '[path][name][ext]',
            },
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            type: 'asset/resource',
          },
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
        path: path.resolve(__dirname, 'anki-jpdb.reader'),
        clean: true,
      },
    };
  },
};
