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

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: argv.mode || 'development',
    entry: {
      main: './src/assets/js/app.js',
      styles: './src/assets/css/main.scss'
    },
  output: {
  path: path.resolve(__dirname, 'dist'),
  filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
  publicPath: './', // 
  clean: true
},

    plugins: [
      new Dotenv(),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].[contenthash].css' : 'css/[name].css'
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        inject: true, // Ensure injection
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true
        } : false
      })
    ],
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
  };
};


