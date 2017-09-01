require('shelljs/global');
env.NODE_ENV = 'production';
var ora = require('ora');
var chalk = require('chalk');
var Webpack = require('webpack');
var merge = require('webpack-merge');
var baseConfig = require('./webpack.base');
// Manifest添加chunkhash,防止缓存
var WebpackManifestPlugin = require('webpack-manifest-plugin');
var WebpackChunkHash = require('webpack-chunk-hash');
var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

console.log(
    '\n' +
    '  Tips:\n' +
    '  Built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
);

// '正为生产环境打包，耐心点，不然自动关机。。。'
var spinner = ora({
    color: 'green',
    text: 'building for production...'
});
spinner.start();

rm('-rf', '../static/');
baseConfig = merge(baseConfig, {
    devtool: 'source-map',
    plugins: [
        new Webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false,  // remove all comments
            },
            compressor: {
                warnings: false,
                drop_debugger: true,
                drop_console: true,
                pure_funcs: ['console.log']
            },
            sourceMap: true
        }),

        new Webpack.optimize.DedupePlugin(), //删除类似的重复代码
        new Webpack.optimize.OccurrenceOrderPlugin(), //计算优化分配模块
        // new Webpack.DefinePlugin({
        //     'process.env.NODE_ENV': JSON.stringify('production'),
        //     __DEV__: false
        // }),
        new Webpack.NoErrorsPlugin(),
        // 生成打包资源列表 json 文件
        new WebpackManifestPlugin(),
        // 取代 webpack 原生的 hash 函数
        new WebpackChunkHash(),
        // 标识每个模块 hash 值，当你添加新的模块时，如果该模块的依赖影响到别的模块
        // 就可以更新这些受影响的模块从而区分旧的模块
        new Webpack.HashedModuleIdsPlugin(),

        // 生成资源映射文件，包含文件名以及与其对应的hash过的文件名，用于其他插件或者服务
        new ChunkManifestPlugin({
            filename: 'chunk-manifest.json',
            manifestVariable: 'webpackManifest'
        })
    ]
});

Webpack(baseConfig, function(err, status) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(status.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n');

    console.log(chalk.blue('goodluck!'));
    console.log(chalk.blue.bgRed.bold('completed the building for your packages.'));
});