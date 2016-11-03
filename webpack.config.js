var path = require('path')
var PATH = {
  src: path.join(__dirname, "src"),
}

module.exports = {
  devtool: 'source-map',
  entry: PATH.src,
  output: {
    path: 'dist',
    filename: 'bundle.js',
    publicPath: '/assets/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: PATH.src,
        loader: 'babel',
      },
      {
        test: /\.sass$/,
        include: PATH.src,
        loaders: ["style", "css?sourceMap", "sass?sourceMap"]
      }
    ]
  },
};
