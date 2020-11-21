'use strict'

const { resolve, join } = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { IgnorePlugin, HotModuleReplacementPlugin } = require('webpack')

// directories
const DIR = {
  BUILD: join(__dirname, 'dist'),
  APP: join(__dirname, 'src'),
}

module.exports = (env, { mode } = { mode: 'production' }) => {
  // production config
  const isProd = (env && (env.prod || env.production)) || mode == 'production'

  const i = isProd ? 0 : 1

  return {
    /**
     * @description
     */
    mode: ['production', 'development'][i],
    // mode: isProd ? 'production' : isDev && 'development',

    /**
     * Stop compilation early in production
     */
    bail: isProd,

    /**
     * Use different devtool based on env
     */
    devtool: ['source-map', 'cheap-module-source-map'][i],
    // devtool: isProd ? 'source-map' : isDev && 'cheap-module-source-map',

    /**
     * The point or points where to start the
     * application bundling process. If an
     * array is passed then all items will
     * be processed.
     */
    entry: {
      app: './src/index',
    },

    output: [
      {
        filename: 'static/js/[name].[contenthash:8].bundle.js',
        path: resolve(__dirname, 'build'),
        publicPath: '/',
        chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
        globalObject: 'this',
        assetModuleFilename: 'static/assets/[hash][ext][query]',
      },
      {
        chunkFilename: 'static/js/[name].chunk.js',
        globalObject: 'this',
        pathinfo: true,
        filename: 'static/js/bundle.js',
        publicPath: '/',
      },
    ][i],

    ...[
      {
        optimization: {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                // Added for profiling in devtools
                keep_classnames: true,
                keep_fnames: true,
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
            }),
            new CssMinimizerPlugin(),
          ],
        },
      },
      null,
    ][i],

    /**
     * Determines how the different types
     * of modules within a project will
     * be treated.
     */
    module: {
      // strictExportPresence: true,
      /**
       * An array of Rules which are matched
       * to requests when modules are
       * created. These rules can modify how
       * the module is created. They can
       * apply loaders to the module, or
       * modify the parser.
       */
      rules: [
        { parser: { requireEnsure: false } },
        // CSS, PostCSS, and Sass
        {
          test: /\.(scss|css)$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
          generator: {
            filename: 'static/styles/[hash][ext][query]',
          },
        },
        {
          test: /\.(js|jsx)$/,
          use: {
            loader: 'babel-loader',
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(?:ico|gif|png|jpe?g)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
          type: 'asset/inline',
        },
      ],
    },

    /**
     * These options change how modules
     * are resolved.
     */
    resolve: {
      extensions: ['*', '.js', '.jsx'],

      modules: ['node_modules'],

      extensions: [
        'web.mjs',
        'mjs',
        'web.js',
        'js',
        'web.ts',
        'ts',
        'web.tsx',
        'tsx',
        'json',
        'web.jsx',
        'jsx',
      ]
        .map(ext => `.${ext}`)
        .filter(ext => !ext.includes('ts')),

      // we add aliases here fo,µr imports
      alias: {
        src: resolve(__dirname, './src'),
      },
    },

    ...[
      null,
      {
        /**
         * Set of options defined for dev server:
         * https://webpack.js.org/configuration/dev-server/#devserver
         */
        devServer: {
          historyApiFallback: true,
          contentBase: DIR.BUILD,
          open: true,
          compress: true,
          hot: true,
          port: process.env.PORT || 3001,
          host: process.env.HOST || 'localhost',
        },
      },
    ][i],

    /**
     * Additional plugins to extend as part
     * of webpack build process
     */
    ...[
      {
        plugins: [
          new CleanWebpackPlugin(),
          new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: true,
            template: 'public/index.html',
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
            templateParameters: {
              PUBLIC_URL: '/',
            },
          }),
          // Create the stylesheet under 'styles' directory
          new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          }),
          new IgnorePlugin(/^\.\/locale$/, /moment$/),
        ],
      },
      {
        plugins: [
          new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'public/index.html',
            inject: 'body',
            minify: {
              html5: true,
              removeComments: true,
              collapseWhitespace: true,
            },
            templateParameters: {
              PUBLIC_URL: '',
            },
          }),
          new HotModuleReplacementPlugin(),
        ],
      },
    ][i],
  }
}
