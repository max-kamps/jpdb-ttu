const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const views = ['settings', 'popup'];
const styles = ['toast', 'word'];

const apps = ['ajb']; // ['ajb', 'asbplayer', 'nhk.or.jp', 'netflix.com', 'crunchyroll.com'];

const generate = (array, prefix, target, source = 'ts', targetExt = 'js') =>
  array.reduce(
    (curr, item) =>
      Object.assign(curr, {
        [item]: {
          import: `./src/${prefix}/${item}.${source}`,
          filename: `${target}/${item}.${targetExt}`,
        },
      }),
    {},
  );

module.exports = {
  async config(env) {
    return {
      mode: env,
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        extensionAlias: {
          '.ts': ['.js', '.ts'],
          '.cts': ['.cjs', '.cts'],
          '.mts': ['.mjs', '.mts'],
        },
        alias: {
          '@shared': path.resolve(__dirname, 'src/shared'),
          '@styles': path.resolve(__dirname, 'src/styles'),
        },
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            { from: 'assets', to: 'assets' },
            { from: 'manifest.json', to: 'manifest.json' },
            { from: 'hosts.json', to: 'hosts.json' },
          ],
        }),
        new HtmlBundlerPlugin({
          entry: {
            'background-worker': './src/background-worker/background-worker.ts',
            ...generate(views, 'views', 'views', 'html', 'html'),
            ...generate(apps, 'apps', 'apps', 'ts', 'js'),
            ...generate(styles, 'styles', 'css', 'scss', 'css'),
          },
          js: { outputPath: 'js' },
          css: { outputPath: 'css' },
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
