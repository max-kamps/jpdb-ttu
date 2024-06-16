const { config } = require('./webpack.common.js');

module.exports = async () => await config('production');
