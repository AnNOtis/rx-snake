const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const PATH = {
  src: path.join(__dirname, 'src'),
}

module.exports = {
  devtool: 'source-map',
  entry: PATH.src,
  output: {
    path: 'dist',
    filename: 'bundle.js',
    publicPath: '/assets/',
  },
  resolve: {
    root: [ PATH.src ],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: PATH.src,
        loader: 'babel',
      },
      {
        test: /\.css/,
        include: PATH.src,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?sourceMap'
        ),
      },
      {
        test: /\.mp3/,
        include: PATH.src,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
  ],
}
