const path = require('path');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.config');

module.exports = merge(baseConfig, {
    entry: {
        main: path.join(__dirname, 'src/main/index.js'),
        'preload-player': path.join(__dirname, 'src/main/preload-player.js')
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    target: 'electron-main'
});