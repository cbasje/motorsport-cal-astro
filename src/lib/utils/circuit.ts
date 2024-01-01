import type { Circuit, SeriesId } from "$db/schema";

const regionNames = new Intl.DisplayNames(undefined, { type: "region" });

export const getCircuitTitle = (
	series: SeriesId,
	circuitTitle: string,
	countryCode: string | null,
	locality: Circuit["locality"]
) => {
	if (series === "INDY") {
		return locality ? locality : circuitTitle;
	} else if (countryCode) {
		return regionNames.of(countryCode);
	}
	return undefined;
};
