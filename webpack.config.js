const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const conf = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'build.js',
    //   publicPath: '/',
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'build'),
        overlay: true,
        historyApiFallback: true,
    },
    module: {
      rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env', 
                        '@babel/preset-react'
                    ]
                }
            }
        },
        {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                use: "css-loader"
            })
        },
        {
            test: /\.(png|jpe?g|gif|svg)$/i,
            loader: 'file-loader',
            options: {
                outputPath: 'images',
            }
        },
        {
            test: /\.(woff|woff2|ttf)$/,
            use: {
                loader: 'url-loader',
            },
        },
      ]
    },
    plugins: [
        new ExtractTextPlugin("build.css"),
        new HtmlWebpackPlugin({
            title: 'Stocks Dynamics',
            'meta': {
                'viewport': 'width=device-width, initial-scale=1',
            },
        }),
    ]
  }

module.exports = (env, options) => {
    const production = options.mode === 'production';

    conf.devtool = production
                    ? false
                    : 'eval-sourcemap';
    
    return conf;
}