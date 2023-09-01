setTimeout(() => {
    const primary = getComputedStyle(document.body).getPropertyValue(
        "--arc-palette-foregroundPrimary"
    );

    const hue = rgbToHSL(primary).h;
    if (hue) {
        document.documentElement.style.setProperty("--arc-hue", String(hue));
    }
}, 500);

const rgbToHSL = (rgb: string) => {
    // strip the leading # if it's there
    rgb = rgb.replace(/^\s*#|\s*$/g, "");

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (rgb.length == 3) {
        rgb = rgb.replace(/(.)/g, "$1$1");
    }

    var r = parseInt(rgb.slice(0, 2), 16) / 255,
        g = parseInt(rgb.slice(2, 4), 16) / 255,
        b = parseInt(rgb.slice(4, 6), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    } else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    } else if (cMax == g) {
        h = 60 * ((b - r) / delta + 2);
    } else {
        h = 60 * ((r - g) / delta + 4);
    }

    if (delta == 0) {
        s = 0;
    } else {
        s = delta / (1 - Math.abs(2 * l - 1));
    }

    return {
        h,
        s,
        l,
    };
};
