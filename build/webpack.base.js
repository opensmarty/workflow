// 导入路径包
var path = require('path');
var glob = require('glob');
// base
var Webpack = require('webpack');
// 能将所有入口中引用的 *.css ，移动到独立分离的css文件。可以放到一个单独的css文件当中。
// var    HtmlWebpackInlineAssetsPlugin = require('html-webpack-inline-assets-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
// 压缩html
var HtmlWebpackPlugin = require('html-webpack-plugin');

// 过滤console输出
//     WebpackStrip = require('strip-loader'),
// CleanWebpackPlugin = require('clean-webpack-plugin');


// 定义目录
var ROOT_PATH = path.resolve(__dirname);
// 判断是否是开发环境 还是线上环境
var isLine = process.env.NODE_ENV === 'production';

// webpack 基础配置
var config = {
    entry: {
        'vendor': ['./src/libs/vendor/jquery.js', './src/libs/vendor/bootstrap.js', './src/libs/vendor/underscore.js']
    },
    output: {
        path: path.resolve(__dirname, '../static'),
        publicPath: '',
        filename: isLine ? 'static/js/[name].[chunkhash:5].js' : 'static/js/[name].js',
        chunkFilename: isLine ? 'chunk/[id][name]-[chunkhash:5].js' : 'chunk/[id][name].js?[chunkhash:5]',
    },
    resolve: {
        extensions: ['*', '.js', '.json', '.css', '.scss', 'styl'],
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /(node_modules)/, // 排除node_modules 文件
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                        plugins: ['transform-runtime']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    // 编译后使用什么loader来提取css文件，如下使用 style-loader 来提取
                    fallback: 'style-loader',
                    // 需要什么样的loader去编译文件，比如如下使用css-loader 去编译文件
                    use: ['css-loader']
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'sass-loader'
                    ]
                })
            },
            {
                test: /\.styl$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'stylus-loader'
                    ]
                })
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader'
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|ico)$/i,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'static/images/[name].[hash:5].[ext]',
                        //publicPath: '../../'
                    }
                }
            },
            {
                test: /\.(svg|woff|woff2|ttf|eot)$/i,
                use: {
                    loader: "file-loader",
                    options: {
                        name: 'static/fonts/[name].[hash:5].[ext]',
                        //publicPath: '../../',
                    }
                }
            }
        ]
    },
    plugins: [
        // 详见 https://doc.webpack-china.org/plugins/extract-text-webpack-plugin/#-extract
        new ExtractTextPlugin({
            filename: 'static/css/[name].[contenthash:5].css',
            allChunks: true,
            // 是否禁用插件 线上不禁用，日常环境禁用(如果不禁用的话，热加载就不会实时生效)
            disable: isLine ? false : true
        })
    ]
}

/*
 获取项目中多个入口文件
*/
function getEntries(paths) {
    // node 中同步获取文件列表
    var files = glob.sync(paths),
        entries = {};

    files.forEach(function(filepath) {
        var toArray = filepath.split('/');
        var filename = toArray[toArray.length - 2];
        entries[filename] = filepath;
    });
    return entries;
}

var entries = getEntries('./src/pages/*/index.js');
var hot = 'webpack-hot-middleware/client?reload=true';
entries['index'] = './src/index.js';
console.log(' entries', entries);

// 获取入口文件的长度
var entriesLength = Object.keys(entries).length;

/*
 HtmlWebpackPlugin 该插件将为您生成一个 html5文件
 filename: 输出的HTML文件名
 template 模板文件路径
 inject true | 'head' | 'body' | false  设置true或body，所有的js资源文件将被放置到 body元素的底部。
 chunks: 允许添加某些块
 chunksSortMode: 允许控制块在添加页面之前的排序方式
 */
// 判断是 单入口页面 or 多入口页面
if (entriesLength === 1) {
    Object.keys(entries).forEach(function(name) {
        config.entry[name] = isLine ? entries[name] : [hot, entries[name]];
        var htmlPlugin = new HtmlWebpackPlugin({
            // favicon: './favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
            filename: name + '.html', //生成的html存放路径，相对于path
            template: name === 'index' ? './src/index.html' : './src/pages/' + name + '/index.html', //html模板路径

            inject: true, //js插入的位置，true/'head'/'body'/false
            hash: true, //为静态资源生成hash值
            chunks: [name, 'vendor', 'manifest'], //需要引入的chunk，不配置就会引入所有页面的资源
            chunksSortMode: 'dependency',
            minify: { //压缩HTML文件
                removeComments: isLine ? true : false, // true 移除HTML中的注释
                collapseWhitespace: isLine ? false : true //删除空白符与换行符
            }
        });
        config.plugins.push(htmlPlugin);
    });
    /*
     * CommonsChunkPlugin 是提取公共代码块使用的
      name: ['vendor'] 是提取公共代码块后的js文件的名字为 vendor.js
      minChunks: (module, count)
        module 参数代表每个chunks里的模块，这些chunks是通过 name参数传入的。
        count 参数表示module 被使用的chunk数量
      具体含义： 如果模块是一个路径，而且模块路径中含有 node_modules 这个名字的话，并且模块以 .js文件结尾的插件
     */
    config.plugins.push(new Webpack.optimize.CommonsChunkPlugin({
        name: ['vendor'],
        minChunks: (module, count) => (
            module.resource && module.resource.indexOf('node_modules') >= 0 &&
            module.resource.match(/\.js$/)
        )
    }));
} else {
    Object.keys(entries).forEach(function(name) {
        config.entry[name] = isLine ? entries[name] : [hot, entries[name]];
        var htmlPlugin = new HtmlWebpackPlugin({
            // favicon: './favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
            filename: name + '.html',
            template: name === 'index' ? './src/index.html' : './src/pages/' + name + '/index.html',
            inject: true,
            hash: true, //为静态资源生成hash值
            chunks: [name, name + '.vendor', 'vendor', 'manifest'],
            chunksSortMode: 'dependency',
            minify: { //压缩HTML文件
                removeComments: isLine ? true : false, // true 移除HTML中的注释
                collapseWhitespace: isLine ? false : true //删除空白符与换行符
            }
        });
        config.plugins.push(htmlPlugin);
    });
    config.plugins.push(new Webpack.optimize.CommonsChunkPlugin({
        name: ['vendor', 'manifest'],
        minChunks: 2
    }));
}

 /* 跟业务代码一样，该兼容的还是得兼容 */
config.plugins.push(
    new Webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        'window.$': 'jquery'
    }));

module.exports = config;