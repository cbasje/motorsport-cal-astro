import type { SeriesId } from "lib/types";

export type Param =
    | "round-title"
    | "round-number"
    | "round-circuit"
    | "round-link"
    | "session-title"
    | "session-day"
    | "session-start-time"
    | "session-end-time"
    | "session-gmt-offset"
    | "session-time-zone";
export type Type = "attr" | "key" | "text" | "api" | "contents";

export interface ScraperSeries {
    id: SeriesId;
    baseUrl: string;
    baseApiUrl?: string;
    season: number | string;
    rounds: Rounds;
}

export interface Rounds {
    url?: string;
    selector?: string;
    link: Link;
    sponsors?: string[];
    actions: RoundAction[];
    sessions: Sessions;
}

export interface RoundAction {
    param: Param;
    type: Type;
    selector?: string;
    attr?: string;
    regex?: string;
    key?: string;
}

export interface Link {
    type: Type;
    attr?: string;
    selector?: string;
    apiUrl?: string;
    apiParams?: string;
    key?: string;
}

export interface Sessions {
    items: Link;
    actions: SessionAction[];
    date: Format;
}

export interface SessionAction {
    param: Param;
    type: Type;
    selector?: string;
    attr?: string;
    regex?: string;
    key?: string;
}

export interface Format {
    start: string;
    end: string;
    date?: string;
    parse?: string;
}
