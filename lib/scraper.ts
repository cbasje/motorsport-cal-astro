import {
    AnyNode,
    BasicAcceptedElems,
    CheerioAPI,
    load as loadCheerio,
} from "cheerio";
import { DateTime } from "luxon";
import fetch from "node-fetch";
import {
    CircuitTitle,
    NewSession,
    SessionType,
    ScraperSeries,
    ScraperAction,
    SeriesId,
} from "./types";

import { saveRound, saveSessions } from "./api";
import scraperData from "./scraper-data";

const sessionAliases: Record<SessionType, string> = {
    SHAKEDOWN: "((?:Pre-Season Testing|Session|Day)( \\d)?)",
    PRACTICE: "(Practice( \\d)?)",
    QUALIFYING: "((?:Qualifying|Qualifications|Hyperpole)( \\d)?)",
    RACE: "(Race|Round)",
    SPRINT: "(Sprint)",
};
const circuitAliases: Record<CircuitTitle, string> = {
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

export const main = async () => {
    try {
        console.time("Scraping...");
        await scrape();
        console.timeEnd("Scraping...");
    } catch (error: any) {
        console.error("main: ", error.message);
    }
};

const getAttr = (
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
const getText = (
    $: CheerioAPI,
    context: BasicAcceptedElems<AnyNode> | null,
    selector: string | undefined,
    regex?: string
) => {
    let t = $(selector, context).first().text().trim();

    if (regex) {
        const matches = t.match(new RegExp(regex, "i"));
        t = matches && matches[1] ? matches[1].trim() : "";
    }
    return t;
};
const getDate = (
    sessionDate: string | null,
    sessionStartTime: string | null,
    sessionEndTime: string | null
) => {
    if (sessionEndTime === null) {
        const twoHours = 2 * 60 * 60 * 1000;
        const start = new Date(`${sessionDate} ${sessionStartTime}`);

        return [start, new Date(start.valueOf() + twoHours)];
    }
    return [
        new Date(`${sessionDate} ${sessionStartTime}`),
        new Date(`${sessionDate} ${sessionEndTime}`),
    ];
};

const scrape = async () => {
    let includedSeries: SeriesId[] = ["F1", "FE"];

    for (const s of scraperData) {
        if (includedSeries.length && !includedSeries.includes(s.id)) continue;

        const url = new URL(s.url, s.baseUrl);

        try {
            const res = await fetch(url);
            const html = await res.text();

            const $ = loadCheerio(html);

            let sessions: NewSession[] = [];

            let i = 0;
            const rounds = $(s.rounds.selector, html);
            for await (const r of rounds) {
                // console.log(i++, s.id);

                const linkString = $(r)
                    .find(s.rounds.link.selector)
                    .attr(s.rounds.link.attr ?? "href");

                if (!linkString) continue;
                const link = new URL(linkString, s.baseUrl);

                let newSessions = await scrapeItem(s, link);
                if (newSessions) {
                    sessions.push(...newSessions);
                }
            }

            await saveSessions(sessions);
            console.log(`🤖 saved ${sessions.length} new sessions`);
        } catch (error: any) {
            console.error("scrape: ", error.message);
            break;
        }
    }
};

const scrapeItem = async (
    series: ScraperSeries,
    link: URL
): Promise<NewSession[] | null> => {
    try {
        const res = await fetch(link);
        const subHtml = await res.text();

        const sub$ = loadCheerio(subHtml);

        let roundTitle = "",
            roundCircuit = "";

        for (const act of series.rounds.actions) {
            let actionResult: string;

            switch (act.type) {
                case "attr":
                    if (act.attr === undefined)
                        throw new Error("Undefined 'act.attr'");
                    actionResult = getAttr(
                        sub$,
                        null,
                        act.selector === "" ? undefined : act.selector,
                        act.attr,
                        act.regex
                    );
                    break;
                case "text":
                    actionResult = getText(
                        sub$,
                        null,
                        act.selector === "" ? undefined : act.selector,
                        act.regex
                    );
                    break;
                default:
                    throw new Error("Unexpected 'act.type'");
            }

            switch (act.param) {
                case "round-title":
                    roundTitle = actionResult;
                    break;
                case "round-circuit":
                    // for (const alias in circuitAliases) {
                    //     const regexString =
                    //         circuitAliases[alias as CircuitTitle];
                    //     const regex = new RegExp(regexString, "gi");

                    //     if (regex.test(actionResult)) {
                    //         roundCircuit = alias;
                    //         break;
                    //     } else {
                    //         throw new Error("No suitable 'CircuitTitle' found");
                    //     }
                    // }
                    roundCircuit = actionResult;
                    break;
            }
        }

        if (!roundTitle || !roundCircuit)
            throw new Error("No 'roundTitle' or 'roundCircuit' found");

        const { id: roundId } = await saveRound({
            title: roundTitle,
            circuitTitle: roundCircuit,
            series: series.id,
            link: link.toString(),
            season: String(series.season),
        });
        if (!roundId) throw new Error("No 'roundId' found");

        let newSessions: NewSession[] = [];

        const sessions = sub$(series.rounds.sessions.selector, subHtml);
        for await (const s of sessions) {
            let sessionType: SessionType = "PRACTICE",
                sessionNumber = 0,
                sessionDate: string | null = null,
                sessionDay: string | null = null,
                sessionStartTime: string | null = null,
                sessionEndTime: string | null = null;

            for (const act of series.rounds.sessions.actions) {
                let actionResult: string;

                switch (act.type) {
                    case "attr":
                        if (act.attr === undefined)
                            throw new Error("Undefined 'act.attr'");
                        actionResult = getAttr(
                            sub$,
                            s,
                            act.selector === "" ? undefined : act.selector,
                            act.attr,
                            act.regex
                        );
                        break;
                    case "text":
                        actionResult = getText(
                            sub$,
                            s,
                            act.selector === "" ? undefined : act.selector,
                            act.regex
                        );
                        break;
                    default:
                        throw new Error("Unexpected 'act.type'");
                }

                switch (act.param) {
                    case "session-title":
                        let titleAliasFound = false;

                        for (const alias in sessionAliases) {
                            const regexString =
                                sessionAliases[alias as SessionType];
                            const regex = new RegExp(regexString, "gi");

                            if (regex.test(actionResult)) {
                                const numbers = actionResult.match(/\b\d?\b/gi);
                                const filteredNumbers = numbers?.filter(
                                    (n) => n != ""
                                );
                                sessionNumber =
                                    filteredNumbers && filteredNumbers[0]
                                        ? Number(filteredNumbers[0])
                                        : 0;

                                titleAliasFound = true;
                                sessionType = alias as SessionType;
                                break;
                            }
                        }

                        if (!titleAliasFound) continue;
                        break;
                    case "session-date":
                        sessionDate = actionResult;
                        break;
                    case "session-day":
                        sessionDay = actionResult;
                        break;
                    case "session-start-time":
                        sessionStartTime = actionResult;
                        break;
                    case "session-end-time":
                        sessionEndTime = actionResult;
                        break;
                }
            }

            let startDate, endDate;
            if (!sessionDay && sessionStartTime && sessionEndTime) {
                startDate = new Date(sessionStartTime);
                endDate = new Date(sessionEndTime);
            } else {
                [startDate, endDate] = getDate(
                    sessionDay,
                    sessionStartTime,
                    sessionEndTime
                );
            }

            if (!startDate || !endDate)
                throw new Error("Invalid 'startDate' or 'endDate'");

            newSessions.push({
                type: sessionType,
                number: sessionNumber,
                startDate,
                endDate,
                roundId,
            });
        }

        return newSessions;
    } catch (error: any) {
        console.error("🚨 Error scraping '%s':", link, error.message);
        return null;
    }
};
