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
