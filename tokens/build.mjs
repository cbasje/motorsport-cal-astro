import StyleDictionaryPackage from "style-dictionary";

// HAVE THE STYLE DICTIONARY CONFIG DYNAMICALLY GENERATED

StyleDictionaryPackage.registerFormat({
    name: "css/variables",
    formatter: function (dictionary, config) {
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16),
                  }
                : null;
        }

        return `${this.selector} {
            ${dictionary.allProperties
                .map((prop) => {
                    if (prop.type === "color") {
                        const rgbValue = hexToRgb(prop.value);
                        return `--${prop.name}: ${rgbValue.r} ${rgbValue.g} ${rgbValue.b};`;
                    } else {
                        return `--${prop.name}: ${prop.value};`;
                    }
                })
                .join("\n")}
        }`;
    },
});

StyleDictionaryPackage.registerTransform({
    name: "sizes/px",
    type: "value",
    matcher: function (prop) {
        // You can be more specific here if you only want 'em' units for font sizes
        return [
            "fontSize",
            "spacing",
            "borderRadius",
            "borderWidth",
            "sizing",
        ].includes(prop.attributes.category);
    },
    transformer: function (prop) {
        // You can also modify the value here if you want to convert pixels to ems
        return parseFloat(prop.original.value) + "px";
    },
});

function getStyleDictionaryConfig(theme) {
    return {
        source: [`tokens/${theme}.json`],
        platforms: {
            web: {
                transforms: ["attribute/cti", "name/cti/kebab", "sizes/px"],
                buildPath: `output/`,
                files: [
                    {
                        destination: `${theme}.css`,
                        format: "css/variables",
                        selector:
                            theme === "global"
                                ? ":root"
                                : `:root[data-theme='${theme}']`,
                    },
                ],
            },
        },
    };
}

console.log("Build started...");

// PROCESS THE DESIGN TOKENS FOR THE DIFFEREN BRANDS AND PLATFORMS

["global", "dark", "light"].map(function (theme) {
    console.log("\n==============================================");
    console.log(`\nProcessing: [${theme}]`);

    const StyleDictionary = StyleDictionaryPackage.extend(
        getStyleDictionaryConfig(theme)
    );

    StyleDictionary.buildPlatform("web");

    console.log("\nEnd processing");
});

console.log("\n==============================================");
console.log("\nBuild completed!");
