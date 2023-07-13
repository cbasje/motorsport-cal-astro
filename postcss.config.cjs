/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        require("postcss-custom-media"),
        // require("postcss-preset-env"),
        require("autoprefixer"),
        require("cssnano"),
    ],
};

module.exports = config;
