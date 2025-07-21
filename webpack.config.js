const Dotenv = require('dotenv-webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const htmlPageNames = [
  { pageName: 'index.html', title: 'Weather APP with REST API' }
];

module.exports = (env, argv) => ({
  mode: argv.mode || 'development',
  devtool: argv.mode === 'development' ? 'source-map' : false,
  entry: ['./src/assets/js/app.js', './src/assets/css/main.scss'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
  },
  optimization: {
    splitChunks: { chunks: 'all' },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer'],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                silenceDeprecations: ['legacy-js-api'],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    // This alias helps to suppress the warning related to 'sass.dart.js'
    alias: {
      'sass/sass.dart.js': false, // Disable resolving this problematic file
    },
    extensions: ['.js', '.json'],
    fallback: {
      fs: false,
      module: false,
    },
  },
  plugins: [
    new Dotenv(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/assets/img', to: 'img' }
      ],
    }),
    ...htmlPageNames.map(
      (name) =>
        new HtmlWebpackPlugin({
          filename: name.pageName,
          title: name.title,
          template: path.resolve(__dirname, `src/${name.pageName}`),
        })
    ),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 9000,
    open: true,
    hot: true,
  },
  // Suppress 'Critical dependency' warnings from Sass
  ignoreWarnings: [
    {
      module: /sass\.dart\.js/,
      message: /Critical dependency/,
    },
  ],
});

