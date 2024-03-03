import type { SeriesId } from "$db/rounds/types";

export const icons: Record<SeriesId, string> = {
	F1: "dashing-away",
	F2: "boy",
	F3: "baby",
	FE: "battery",
	INDY: "eagle",
	WEC: "stopwatch",
	WRC: "snow-capped-mountain",
	F1A: "girl",
};
export const getSeriesIcon = (s: SeriesId | null) => {
	return (s && icons[s]) ?? "police-car-light";
};

export const getSeriesEmoji = (s: SeriesId | null) => {
	const emoji: Record<SeriesId, string> = {
		F1: "💨",
		F2: "👦🏻",
		F3: "👶🏻",
		FE: "🔋",
		INDY: "🦅",
		WEC: "⏱️",
		WRC: "🏔️",
		F1A: "👧🏻",
	};
	return (s && emoji[s]) ?? "🚨";
};

export const getSeriesTitle = (s: SeriesId | null) => {
	const titles: Record<SeriesId, string> = {
		F1: "Formula 1",
		F2: "Formula 2",
		F3: "Formula 3",
		FE: "Formula E",
		INDY: "IndyCar",
		WEC: "WEC",
		WRC: "WRC",
		F1A: "F1 Academy",
	};
	return (s && titles[s]) ?? "Error";
};

export const getSeriesTitleShort = (s: SeriesId | null) => {
	const titles: Record<SeriesId, string> = {
		F1: "F1",
		F2: "F2",
		F3: "F3",
		FE: "FE",
		INDY: "Indy",
		WEC: "WEC",
		WRC: "WRC",
		F1A: "F1A",
	};
	return (s && titles[s]) ?? "Err";
};

export const getSeriesColor = (s: SeriesId | null) => {
	const colors: Record<SeriesId, string> = {
		F1: "#FF3555",
		F2: "#00A1FE",
		F3: "#C75CFE",
		FE: "#6283FE",
		INDY: "#00C3AC",
		WEC: "#46B613",
		WRC: "#FC4C01",
		F1A: "#FD3BAD",
	};
	return (s && colors[s]) ?? "#000";
};
export const getSeriesSecondaryColor = (s: SeriesId) => {
	const colors: Record<SeriesId, string> = {
		F1: "#FF0041",
		F2: "#0090FE",
		F3: "#B943FA",
		FE: "#536FFE",
		INDY: "#00B49D",
		WEC: "#2BA711",
		WRC: "#202A44",
		F1A: "#EF099F",
	};
	return (s && colors[s]) ?? "#000";
};
