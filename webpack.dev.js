const { join } = require('path');
const { merge } = require('webpack-merge');
const { config } = require('./webpack.common.js');

module.exports = async () =>
  merge(await config('development'), {
    devtool: 'source-map',
  });
