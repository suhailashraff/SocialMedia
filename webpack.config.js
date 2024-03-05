const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: 'node',
    entry: './app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
            {
                test: /\.(node|woff|woff2|ttf|otf|eot|svg|png|jpg|jpeg|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/', // or any other directory you prefer
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'package.json', to: '.' },
            ],
        }),
    ],
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    // Add any custom Terser options here
                },
            }),
        ],
    },
};
