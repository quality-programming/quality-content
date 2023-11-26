const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const baseConfig = require('./webpack.base.config');

module.exports = merge(baseConfig, {
    entry: {
        player: path.join(__dirname, 'src', 'player', 'index.js')
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    target: 'web',
    devServer: {
        host: 'localhost',
        port: 8080,
        hot: false,
        liveReload: true,
        static: {
            directory: path.join(__dirname, 'src/static'),
            watch: true,
            staticOptions: {
                ignored: /node_modules/
            },
            publicPath: '/static'
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/player/index.html'),
            filename: 'player.html',
            excludeChunks: ['renderer']
        }),
        new MiniCssExtractPlugin()
    ]
});
