var path = require('path');
var opn = require('opn');
var express = require('express');
var Webpack = require('webpack');
var merge = require('webpack-merge');
var history = require('connect-history-api-fallback');
var WebpackMiddleware = require('webpack-dev-middleware');
var WebpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.base');
config = merge(config, {
    // 开发环境下推荐使用cheap-module-eval-source-map，生产环境下推荐使用cheap-source-map或source-map
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new Webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            },
            '__DEV__': true
        }),
        new Webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        historyApiFallback: {
            disableDotRule: true
        }
    }
});

var port = 8989;

var app = express();

var compiler = Webpack(config);
var middleware = WebpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    hot: true,
    stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
    }
});

app.use(middleware);

app.use(WebpackHotMiddleware(compiler, {
    heartbeat: 2000
}));
app.use(express.static(path.join(__dirname, '../public/')));
app.use(history());

app.listen(port, function onStart(err) {
    var uri = 'http://127.0.0.1:' + port;
    if (err) {
        console.log(err);
    } else {
        console.log(uri);
    }
    opn(uri);
});