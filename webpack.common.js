const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  async config(env) {
    return {
      mode: env,
      entry: {
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
        // ...views.reduce(
        //   (acc, view) =>
        //     Object.assign(acc, {
        //       [`view/${view}`]: {
        //         import: `./src/views/${view}/${view}.ts`,
        //       },
        //     }),
        //   {},
        // ),
        // styles: '@styles/main.scss',
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
        // ...views.map(
        //   (view) =>
        //     new HtmlWebpackPlugin({
        //       filename: `views/${view}.html`,
        //       template: `src/views/${view}/${view}.html`,
        //       chunks: ['styles', `view/${view}`],
        //     }),
        // ),
      ],
      module: {
        // rules: [
        //   {
        //     test: /\.(scss)$/,
        //     include: [path.resolve(__dirname, 'src/styles')],
        //     use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
        //   },
        //   {
        //     test: /\.css|\.s(c|a)ss$/,
        //     include: [
        //       path.resolve(__dirname, 'src/components'),
        //       path.resolve(__dirname, 'src/views'),
        //     ],
        //     use: [
        //       {
        //         loader: 'lit-scss-loader',
        //         options: {
        //           minify: true,
        //         },
        //       },
        //       'extract-loader',
        //       'css-loader',
        //       'sass-loader',
        //     ],
        //   },
        //   {
        //     test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,
        //     type: 'asset/resource',
        //   },
        //   {
        //     test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        //     type: 'asset/resource',
        //   },
        //   {
        //     test: /.([cm]?ts|tsx)$/,
        //     exclude: /node_modules/,
        //     use: [
        //       {
        //         loader: 'ts-loader',
        //         options: {
        //           transpileOnly: true,
        //         },
        //       },
        //     ],
        //   },
        // ],
      },
      output: {
        filename: 'runtime/[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
      },
    };
  },
};
