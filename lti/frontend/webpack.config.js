const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  context: __dirname,
  cache: false,
  entry: './src/index.js',
  output: {
    path: path.resolve('../static/frontend/'),
    filename: 'main.js',
    publicPath: '/static/frontend/'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BundleTracker({
      path: path.resolve("../"),
      filename: 'webpack-stats.json',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },      
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '/',
              publicPath: '/static/frontend/',
              useRelativePaths: true,
            },
          },
        ],
      },
    ],
  },
}
