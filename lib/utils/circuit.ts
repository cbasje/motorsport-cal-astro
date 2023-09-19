import type { SeriesId } from "lib/types";
import type { CircuitSchema } from "lib/types/prisma/circuit";
import type { z } from "zod";

const regionNames = new Intl.DisplayNames(undefined, { type: "region" });

export const getCircuitTitle = (
    series: SeriesId,
    circuitTitle: string,
    countryCode: string | null,
    locality: z.infer<typeof CircuitSchema.shape.locality>
) => {
    if (series === "INDY") {
        return locality ? locality : circuitTitle;
    } else if (countryCode) {
        return regionNames.of(countryCode);
    }
    return undefined;
};
