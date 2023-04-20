export const flattenObject = (obj: Record<string, any>) => {
    return Object.keys(obj).reduce((acc, key) => {
        if (typeof obj[key] === "object" && obj[key] !== null) {
            const flatObject = flattenObject(obj[key]);
            for (const flatKey in flatObject) {
                acc[`${key}.${flatKey}`] = flatObject[flatKey];
            }
        } else {
            acc[key] = obj[key];
        }
        return acc;
    }, {} as Record<string, any>);
};
