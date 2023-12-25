const path              = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public/static'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: './index.template.html'
    }),
  ],
  devServer: {
    static: './static/',
  }
};