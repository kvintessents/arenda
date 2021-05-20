const { resolve } = require('path');
module.exports = {
    entry: "./src/app/app.js",
    target: 'electron-preload',

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
        ],
      },
      resolve: {
        extensions: ['*', '.js', '.jsx'],
      },

    mode: 'development'
}