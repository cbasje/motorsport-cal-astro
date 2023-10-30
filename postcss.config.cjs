const postcssCustomMedia = require("postcss-custom-media");
const postcssNested = require("postcss-nested");
const postcssGlobalData = require("@csstools/postcss-global-data");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        postcssGlobalData({
            files: ["./node_modules/open-props/media.min.css"],
        }),
        postcssCustomMedia({ preserve: true }),
        postcssNested(),
        autoprefixer(),
        cssnano(),
    ],
};

module.exports = config;
