const { join } = require('path');
const { merge } = require('webpack-merge');
const { config } = require('./webpack.common.js');

module.exports = async () =>
  merge(await config('development'), {
    devtool: 'source-map',
    // devServer: {
    //   static: join(__dirname, 'dist'),
    //   liveReload: true,
    //   open: true,
    //   compress: true,
    //   port: 9000,
    // },
  });
