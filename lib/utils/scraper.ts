import type { Format, Param } from "../types/scraper";
import { CircuitTitle, SessionType } from "../types";
import type { AnyNode, BasicAcceptedElems, CheerioAPI } from "cheerio";

export const sessionAliases: Record<SessionType, string> = {
    SHAKEDOWN: "((?:Pre-Season Testing|Session|Day)( \\d)?)",
    PRACTICE: "(Practice( \\d)?)",
    QUALIFYING: "((?:Qualifying|Qualifications|Hyperpole)( \\d)?)",
    RACE: "(Race|Round)",
    SPRINT: "(Sprint)",
};
export const circuitAliases: Record<CircuitTitle, string> = {
    [CircuitTitle.Miami]: "(Miami)",
    [CircuitTitle.Bahrain]: "(Bahrain)",
    [CircuitTitle.Hungaroring]: "(Hungaroring)",
    [CircuitTitle.Spa]: "(Spa-Francorchamps)",
    [CircuitTitle.Monza]: "(Monza)",
    [CircuitTitle.AbuDhabi]: "(Yas[\\s-]?Marina|Abu[s-]?Dhabi)",
    [CircuitTitle.Mexico]: "(Mexico|Hermanos[\\s-]?Rodríguez)",
    [CircuitTitle.Monaco]: "(Monaco)",
    [CircuitTitle.GillesVilleneuve]: "(Montreal|Gilles[\\s-]?Villeneuve)",
    [CircuitTitle.Imola]: "(Imola|Dino[\\s-]?Ferrari)",
    [CircuitTitle.Jeddah]: "(Jeddah)",
    [CircuitTitle.AlbertPark]: "(Melbourne|Albert[\\s-]?Park)",
    [CircuitTitle.Barcelona]: "(Barcelona|Catalunya|Barcelona[\\s-]?Catalunya)",
    [CircuitTitle.Baku]: "(Baku)",
    [CircuitTitle.RedBull]: "(Red[\\s-]?Bull)",
    [CircuitTitle.Silverstone]: "(Silverstone)",
    [CircuitTitle.PaulRicard]: "(Paul[\\s-]?Ricard)",
    [CircuitTitle.Zandvoort]: "(Zandvoort)",
    [CircuitTitle.COTA]: "(COTA|Circuit of The Americas)",
    [CircuitTitle.Singapore]: "(Singapore|Marina[\\s-]?Bay)",
    [CircuitTitle.Suzuka]: "(Suzuka)",
    [CircuitTitle.Interlagos]: "(Interlagos|Carlos[\\s-]?Pace)",
    [CircuitTitle.StPetersburg]: "(St[\\s-]?Petersburg)",
    [CircuitTitle.Texas]: "(Texas)",
    [CircuitTitle.LongBeach]: "(Long[\\s-]?Beach)",
    [CircuitTitle.Barber]: "(Barber)",
    [CircuitTitle.Indy]: "(Indy|Indianapolis)",
    [CircuitTitle.BelleIsle]: "(Detroit|Belle[\\s-]?Isle)",
    [CircuitTitle.RoadAmerica]: "(Road[\\s-]?America)",
    [CircuitTitle.MidOhio]: "(Mid[\\s-]?Ohio)",
    [CircuitTitle.Toronto]: "(Toronto)",
    [CircuitTitle.Iowa]: "(Iowa)",
    [CircuitTitle.Nashville]: "(Nashville)",
    [CircuitTitle.Gateway]: "(Gateway)",
    [CircuitTitle.Portland]: "(Portland)",
    [CircuitTitle.LagunaSeca]: "(Laguna[\\s-]?Seca)",
    [CircuitTitle.Rome]: "(Rome)",
    [CircuitTitle.Berlin]: "(Berlin)",
    [CircuitTitle.Jakarta]: "(Jakarta)",
    [CircuitTitle.Marrakesh]: "(Marrakesh)",
    [CircuitTitle.NewYork]: "(New[\\s-]?York)",
    [CircuitTitle.London]: "(London)",
    [CircuitTitle.Seoul]: "(Seoul)",
    [CircuitTitle.LeMans]: "(Le[\\s-]?Mans)",
    [CircuitTitle.Fuji]: "(Fuji)",
};

export const formatDate = (
    format: string,
    dateInfo: Record<string, string | null>
) => {
    let returnValue = format;

    const regex = /{([a-z\-]+)}/gi;
    const matches = format.matchAll(regex);

    // For each key, replace with value
    for (const m of matches) {
        const keyInc = m[0];
        const key = m[1] as Param;

        let value = "";
        switch (key) {
            case "session-day":
                value = dateInfo.day!;
                break;
            case "session-start-time":
                value = dateInfo.startTime!;
                break;
            case "session-end-time":
                value = dateInfo.endTime!;
                break;
            case "session-gmt-offset":
                value = dateInfo.gmtOffset!;
                break;
            case "session-time-zone":
                value = dateInfo.timeZone!;
                break;
        }

        returnValue = returnValue.replace(keyInc, value);
    }

    // FIXME
    return returnValue.replaceAll(" ET", " EST");
};
export const getAttr = (
    $: CheerioAPI,
    context: BasicAcceptedElems<AnyNode> | null,
    selector: string | undefined,
    attr: string,
    regex?: string
) => {
    let t = "";
    if (!selector && context != null) {
        t = $(context).attr(attr)!.trim();
    } else {
        t = $(selector, context).first().attr(attr)!.trim();
    }

    if (regex) {
        const matches = t.match(new RegExp(regex, "i"));
        t = matches && matches[1] ? matches[1].trim() : "";
    }
    return t;
};
export const getKey = (
    obj: Record<string, any>,
    key: string,
    regex?: string
) => {
    let t = obj[key];

    if (regex) {
        const matches = t.match(new RegExp(regex, "i"));
        if (!matches) return t;

        // TODO: Make cleaner
        if (matches[1] !== undefined) {
            t = matches[1].trim();
        } else if (matches[2] !== undefined) {
            t = matches[2].trim();
        } else if (matches[0] !== undefined) {
            t = matches[0];
        } else {
            return t;
        }
    }
    return t;
};
export const getText = (
    $: CheerioAPI,
    context: BasicAcceptedElems<AnyNode> | null,
    selector: string | undefined,
    regex?: string
) => {
    let t = $(selector, context).first().text().trim();

    if (regex) {
        const matches = t.match(new RegExp(regex, "i"));
        if (!matches) return t;

        // TODO: Make cleaner
        if (matches[1] !== undefined) {
            t = matches[1].trim();
        } else if (matches[2] !== undefined) {
            t = matches[2].trim();
        } else if (matches[0] !== undefined) {
            t = matches[0];
        } else {
            return t;
        }
    }
    return t;
};
export const getDate = (
    format: Format,
    sessionDay: string | null,
    sessionStartTime: string | null,
    sessionEndTime: string | null,
    sessionGmtOffset: string | null,
    sessionTimeZone: string | null
) => {
    const dateInfo = {
        day: sessionDay,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        gmtOffset: sessionGmtOffset,
        timeZone: sessionTimeZone,
    };

    const startDateString = formatDate(format.start, dateInfo);
    const endDateString = formatDate(format.end, dateInfo);

    return [new Date(startDateString), new Date(endDateString)];
};

export const getTitle = (title: string, sponsors?: string[]) => {
    if (sponsors === undefined) return title;

    let t = title;
    for (const s of sponsors) {
        const regex = new RegExp(s, "gi");
        t = t.replace(regex, "");
    }
    return t.trim();
};
export const getCircuitTitle = (t: string) => {
    return t;
};
