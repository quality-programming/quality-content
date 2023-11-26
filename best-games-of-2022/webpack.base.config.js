const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const DEV = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: DEV ? 'development' : 'production',
    devtool: DEV ? 'source-map' : false,
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [
            {
                test: /\.(c|sa|sc)ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(jpg|png|svg)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(ogg)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(webm)$/i,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'node_modules/wallpaper/source/macos-wallpaper' },
                { from: 'node_modules/wallpaper/source/windows-wallpaper-x86-64.exe' }
            ]
        })
    ]
}
