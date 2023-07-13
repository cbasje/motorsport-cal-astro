const postcssCustomMedia = require("postcss-custom-media");
const postcssGlobalData = require("@csstools/postcss-global-data");
// const postcssPresetEnv = require("postcss-preset-env");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        postcssGlobalData({
            files: ["./node_modules/open-props/media.min.css"],
        }),
        postcssCustomMedia({ preserve: true }),
        // postcssPresetEnv,
        autoprefixer(),
        cssnano(),
    ],
};

module.exports = config;
