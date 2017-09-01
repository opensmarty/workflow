const path = require('path'),
    webpack = require('webpack'),
    WebpackManifestPlugin = require('webpack-manifest-plugin'),
    WebpackChunkHash = require('webpack-chunk-hash'),
    ChunkManifestPlugin = require('chunk-manifest-webpack-plugin'),

    // autoprefixer = require('autoprefixer'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    HtmlWebpackPlugin = require('html-webpack-plugin');

// WebpackStrip = require('strip-loader');

const APP_PATH = path.resolve(__dirname),
    SOURCE_PATH = path.resolve(__dirname, 'test/es6'),
    DIST_PATH = APP_PATH + '/dist';
module.exports = {
    entry: {
        main: SOURCE_PATH + '/persion/main.js',
        entry: SOURCE_PATH + '/demo/entry.js',
        entry2: SOURCE_PATH + '/demo/entry2.js'
    },
    output: {
        path: DIST_PATH,
        filename: '[name]-[chunkhash]-boudle.js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: APP_PATH + '/node_modules',
                //include: SOURCE_PATH,
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            },
            //.css 文件使用 style-loader 和 css-loader 来处理
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader',
                        options: {
                            // modules: true // 设置css模块化,详情参考https://github.com/css-modules/css-modules
                        }
                    }, {
                        loader: 'postcss-loader',
                        // 在这里进行配置，也可以在postcss.config.js中进行配置，详情参考https://github.com/postcss/postcss-loader
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')
                                ];
                            }
                        }
                    }
                    ]
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', {
                        loader: "postcss-loader",
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')
                                ];
                            }
                        }
                    }, 'sass-loader']
                })
            },
            // {
            //     test: /\.styl(us)?$/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: 'style-loader',
            //         use: ['css-loader', {
            //             loader: "postcss-loader",
            //             options: {
            //                 plugins: function () {
            //                     return [
            //                         require('autoprefixer')
            //                     ];
            //                 }
            //             }
            //         }, 'stylus-loader']
            //     })
            // },
            //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        minimize: false
                    }
                }
            },

            {
                test: /\.json$/,
                loader: 'json-loader'
            },

            //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
            {
                test: /\.(jpg|jpeg|ico|png|gif|svg)$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: 'images/[name]-[chunkhash].[ext]'
                }
            },

            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&minetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader',
                query: {
                    name: '[name].[ext]?mimetype=application/font-woff2'
                }
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader',
                query: {
                    name: '[name].[ext]?mimetype=application/font-woff2'
                }
            }

        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false,
                drop_console: true,
                pure_funcs: ['console.log']
            },
            sourceMap: false
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),


        //提供公共代码，认会把所有入口节点的公共代码提取出来,生成一个common.js
        // new webpack.optimize.CommonsChunkPlugin({name: "common", filename: "common.js"}),
        //
        // 默认会把所有入口节点的公共代码提取出来,生成一个common.js
        // 只提取main节点和index节点

        new webpack.optimize.CommonsChunkPlugin({
            name: 'common-demo.js',
            chunks: ['entry', 'entry2']
        }),

        // new HtmlWebpackPlugin({
        //     filename: DIST_PATH + '/html/login-[chunkhash].html',
        //     template:_SOURCE_PATH +'/tpl/login.html',
        //     inject:'body',
        //     hash:true,
        //     chunks:['main','user','common.js']   // 这个模板对应上面那个节点
        // }),

        new HtmlWebpackPlugin({
            filename: DIST_PATH + '/html/demo-[chunkhash].html',
            template: SOURCE_PATH + '/demo/index.html',
            inject: 'body',
            hash: true,
            chunks: ['entry', 'entry2', 'common-demo.js'] // 这个模板对应上面那个节点
        }),

        new HtmlWebpackPlugin({
            filename: DIST_PATH + '/html/persion-[chunkhash].html',
            template: SOURCE_PATH + '/persion/index.html'
        }),

        new ExtractTextPlugin({
            filename: 'css/[name]-[chunkhash].css',
            disable: false,
            allChunks: true
        }),

        // 生成打包资源列表 json 文件
        new WebpackManifestPlugin(),

        // 取代 webpack 原生的 hash 函数
        new WebpackChunkHash(),

        // 生成依赖包的块文件，转移所有的`node_modules`依赖到一个特别的该文件中
        // 这允许你更新你的代码时，无需更新依赖
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                //来自node_modules的文件统一打进vendor
                return module.context && module.context.indexOf("node_modules") !== -1;
            }
        }),
        // 生成 `webpack’s runtime` 自身的代码文件
        // 这允许你更新你的代码时，无需更新其他无关代码
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime',
            chunks: ['vendor, manifest'],
            minChunks: Infinity,
        }),



        // 标识每个模块 hash 值，当你添加新的模块时，如果该模块的依赖影响到别的模块
        // 就可以更新这些受影响的模块从而区分旧的模块
        new webpack.HashedModuleIdsPlugin(),

        // 生成资源映射文件，包含文件名以及与其对应的hash过的文件名，用于其他插件或者服务
        new ChunkManifestPlugin({
            filename: 'chunk-manifest.json',
            manifestVariable: 'webpackManifest'
        })
    ]
}