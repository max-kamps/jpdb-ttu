const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const views = ['settings', 'popup'];
const styles = ['toast', 'word'];

const foregroundApps = ['nhk.or.jp', 'crunchyroll.com'];
const foregroundScripts = ['install-parser', 'install-toaster'];

const fromArray = (array, prefix, source = 'ts', target = 'js') =>
  array.map((item) => ({
    import: `./src/${prefix}/${item}.${source}`,
    filename: `${prefix}/${item}.${target}`,
  }));

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
          '@foreground': path.resolve(__dirname, 'src/foreground'),
          '@background': path.resolve(__dirname, 'src/background'),
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
            // service-worker
            {
              filename: 'service-worker.js',
              import: './src/service-worker.ts',
            },
            ...fromArray(views, 'views', 'html', 'html'),
            ...fromArray(styles, 'styles', 'scss', 'css'),

            // foreground (everything that is not a background script)
            ...fromArray(foregroundApps, 'foreground/apps'),
            ...fromArray(foregroundScripts, 'foreground/scripts'),
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
