const { resolve } = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./src/app/app.jsx",
    target: 'electron-preload',

    devtool: 'eval-source-map',

    output: {
        path: resolve(__dirname, "./src/build/"),
        filename: 'preload-bundle.js',
    },

    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
          },

          {
            test: /\.(sc|c|sa)ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2,
                },
              },
              // You have to put in after `css-loader` and before any `pre-precessing loader`
              { loader: 'scoped-css-loader' },
              {
                loader: 'sass-loader',
              },
            ],
          }
        ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "style-bundle.css",
            chunkFilename: "[id].css",
        }),
    ],

    resolve: {
      extensions: ['*', '.js', '.jsx'],
    },

    mode: 'development'
}