import type { Circuit, Round, Session } from "@prisma/client";

export const seriesIds = [
    "F1",
    "F2",
    "FE",
    "XE",
    "INDY",
    "W",
    "WEC",
    "F1A",
] as const;
export type SeriesId = (typeof seriesIds)[number];
export type SessionType =
    | "PRACTICE"
    | "QUALIFYING"
    | "RACE"
    | "SPRINT"
    | "SHAKEDOWN";
export enum CircuitTitle {
    Miami = "Miami International Autodrome",
    Bahrain = "Bahrain International Circuit",
    Hungaroring = "Hungaroring",
    Spa = "Circuit de Spa-Francorchamps",
    Monza = "Monza Circuit",
    AbuDhabi = "Yas Marina Circuit",
    Mexico = "Autódromo Hermanos Rodríguez",
    Monaco = "Circuit de Monaco",
    GillesVilleneuve = "Circuit Gilles Villeneuve",
    Imola = "Imola Circuit",
    Jeddah = "Jeddah Corniche Circuit",
    AlbertPark = "Albert Park Circuit",
    Barcelona = "Circuit de Barcelona-Catalunya",
    Baku = "Baku City Circuit",
    RedBull = "Red Bull Ring",
    Silverstone = "Silverstone Circuit",
    PaulRicard = "Circuit Paul Ricard",
    Zandvoort = "Circuit Zandvoort",
    COTA = "Circuit of the Americas",
    Singapore = "Marina Bay Street Circuit",
    Suzuka = "Suzuka International Racing Course",
    Interlagos = "Interlagos Circuit",
    StPetersburg = "St. Petersburg, Florida",
    Texas = "Texas Motor Speedway",
    LongBeach = "Long Beach, California",
    Barber = "Barber Motorsports Park",
    Indy = "Indianapolis Motor Speedway",
    BelleIsle = "Belle Isle Park (Michigan)",
    RoadAmerica = "Road America",
    MidOhio = "Mid-Ohio Sports Car Course",
    Toronto = "Grand Prix of Toronto",
    Iowa = "Iowa Speedway",
    Nashville = "Nashville Street Circuit",
    Gateway = "Gateway Motorsports Park",
    Portland = "Portland International Raceway",
    LagunaSeca = "WeatherTech Raceway Laguna Seca",
    Rome = "Circuito Cittadino dell'EUR",
    Berlin = "Tempelhof Airport Street Circuit",
    Jakarta = "Jakarta International e-Prix Circuit",
    Marrakesh = "Circuit International Automobile Moulay El Hassan",
    NewYork = "Brooklyn Street Circuit",
    London = "ExCeL London",
    Seoul = "Seoul ePrix",
    LeMans = "Circuit de la Sarthe",
    Fuji = "Fuji Speedway",
}

// MARK: Scraper
export interface ScraperSeries {
    id: SeriesId;
    baseUrl: string;
    season: number | string;
    rounds: ScraperRounds;
}

export interface ScraperRounds {
    url: string;
    selector: string;
    link: ScraperLink;
    actions: ScraperAction[];
    sessions: ScraperSessions;
}

type ScraperParam =
    | "round-title"
    | "round-number"
    | "round-circuit"
    | "round-link"
    | "session-title"
    | "session-date"
    | "session-day"
    | "session-start-time"
    | "session-end-time";
type ScraperLinkType = "api" | "attr";
type ScraperType = "attr" | "text";
export interface ScraperAction {
    param: ScraperParam;
    type: ScraperType;
    attr?: string;
    key?: string;
    selector: string;
    regex?: string;
}

export interface ScraperLink {
    type: ScraperLinkType;
    attr?: string;
    key?: string;
    selector?: string;
    apiUrl?: string;
    apiParams?: string;
}

export interface ScraperSessionsItems {
    type: string;
    selector?: string;
    apiUrl?: string;
    apiParams?: string;
    key?: string;
}

export interface ScraperSessions {
    items: ScraperSessionsItems;
    actions: ScraperAction[];
}

// MARK: API
export type NewRound = Omit<Round, "circuitId" | "id" | "created_at"> & {
    circuitTitle: string;
};
export type NewSession = Omit<Session, "id" | "created_at">;
export type NewCircuit = Omit<Circuit, "id" | "created_at">;

// MARK: WIKIPEDIA
export interface WikipediaData {
    batchcomplete: boolean;
    query: Query;
}

export interface Query {
    pages?: Page[];
}

export interface Page {
    pageid: number;
    ns: number;
    title: string;
    index: number;
    coordinates?: Coordinate[];
}

export interface Coordinate {
    lat: number;
    lon: number;
    primary: boolean;
    globe: string;
}
