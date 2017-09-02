module.exports = {
    plugins: [
        require('autoprefixer')({
            browsers: ['>1%', 'last 5 versions', 'Firefox ESR', 'not ie < 9']
        })
    ]
}