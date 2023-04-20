import {
    AnyNode,
    BasicAcceptedElems,
    CheerioAPI,
    load as loadCheerio,
} from "cheerio";
import fetch from "node-fetch";
import { saveRound, saveSessions } from "./api";
import scraperData from "./scraper-data";
import { CircuitTitle, SeriesId, SessionType } from "./types";
import type { NewSession } from "./types/api";
import type { Format, Param, ScraperSeries } from "./types/scraper";

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
    } catch (error) {
        console.error("main: ", error);
    }
};

const formatDate = (
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
    format: Format,
    sessionDay: string | null,
    sessionStartTime: string | null,
    sessionEndTime: string | null,
    sessionGmtOffset: string | null,
    sessionTimeZone: string | null
) => {
    // 🚀 --------------------------------🚀
    // 🚀 ~ X; sessionDate; sessionDay; sessionTime; sessionStartTime; sessionEndTime
    // 🚀 --------------------------------🚀
    // 🚀 ~ F1; null; ; null; 2023-03-05T18:00:00; 2023-03-05T20:00:00;
    // 🚀 --------------------------------🚀
    // 🚀 ~ FE; null; 2023-01-13; null; 16:25; 17:15;
    // 🚀 --------------------------------🚀
    // 🚀 ~ INDY; null; Friday, Mar 3; 3:00 PM - 4:15 PM ET; null; null; ----- "Thu, 01 Jan 1970 00:00:00 GMT-0400"
    // 🚀 --------------------------------🚀

    const dateInfo = {
        day: sessionDay,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        gmtOffset: sessionGmtOffset,
        timeZone: sessionTimeZone,
    };

    const startDateString = formatDate(format.start, dateInfo);
    const endDateString = formatDate(format.end, dateInfo);
    console.log("🚀 ---------------------------------🚀");
    console.log("🚀 ~ endDateString:", endDateString, new Date(endDateString));
    console.log("🚀 ---------------------------------🚀");

    return [new Date(startDateString), new Date(endDateString)];
};

const scrape = async () => {
    let includedSeries: SeriesId[] = ["F1", "FE", "INDY"];

    for (const s of scraperData) {
        if (includedSeries.length && !includedSeries.includes(s.id)) continue;

        try {
            let i = 0;
            let url: URL;
            let res: Awaited<ReturnType<typeof fetch>>;
            let rounds;
            let sessions: NewSession[] = [];

            switch (s.rounds.link.type) {
                case "api":
                    url = new URL(
                        s.rounds.link.apiUrl! + s.rounds.link.apiParams,
                        s.baseUrl
                    );
                    res = await fetch(url);

                    const data = (await res.json()) as Record<string, any>;
                    rounds = data[s.rounds.link.key!];

                    for await (const r of rounds) {
                        let newSessions = await scrapeRoundAPI(s, r, i);
                        if (newSessions) {
                            sessions.push(...newSessions);
                        }

                        i++;
                    }
                    break;
                case "attr":
                    url = new URL(s.rounds.url!, s.baseUrl);

                    res = await fetch(url);
                    const html = await res.text();

                    const $ = loadCheerio(html);
                    rounds = $(s.rounds.selector, html);

                    for await (const r of rounds) {
                        const roundUrlString = $(r)
                            .find(s.rounds.link.selector)
                            .attr(s.rounds.link.attr ?? "href");

                        if (!roundUrlString) continue;
                        const roundUrl = new URL(roundUrlString, s.baseUrl);

                        let newSessions = await scrapeRound(s, roundUrl, i);
                        if (newSessions) {
                            sessions.push(...newSessions);
                        }

                        i++;
                    }
                    break;
            }

            await saveSessions(sessions);
            console.log(`🤖 saved ${sessions.length} new sessions`);
        } catch (error) {
            console.error("scrape: ", error);
            break;
        }
    }
};

const scrapeRound = async (
    series: ScraperSeries,
    link: URL,
    index: number
): Promise<NewSession[] | null> => {
    try {
        const res = await fetch(link);
        const subHtml = await res.text();

        const sub$ = loadCheerio(subHtml);

        let roundTitle = "",
            roundCircuit = "",
            roundNumber = 0;

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
                case "round-number":
                    roundNumber = Number(actionResult);
                    break;
            }
        }

        if (!roundTitle || !roundCircuit)
            throw new Error("No 'roundTitle' or 'roundCircuit' found");

        const { id: roundId } = await saveRound({
            title: roundTitle,
            number: roundNumber === 0 ? index + 1 : roundNumber,
            circuitTitle: roundCircuit,
            series: series.id,
            link: link.toString(),
            season: String(series.season),
        });
        if (!roundId) throw new Error("No 'roundId' found");

        let newSessions: NewSession[] = [];

        const sessions = sub$(series.rounds.sessions.items.selector, subHtml);
        for await (const s of sessions) {
            let sessionType: SessionType = "PRACTICE",
                sessionNumber = 0,
                sessionDay: string | null = null,
                sessionStartTime: string | null = null,
                sessionEndTime: string | null = null,
                sessionGmtOffset: string | null = null,
                sessionTimeZone: string | null = null;

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
                    case "session-day":
                        sessionDay = actionResult;
                        break;
                    case "session-start-time":
                        sessionStartTime = actionResult;
                        break;
                    case "session-end-time":
                        sessionEndTime = actionResult;
                        break;
                    case "session-gmt-offset":
                        sessionGmtOffset = `${
                            !actionResult.includes("+") &&
                            !actionResult.includes("-")
                                ? "+"
                                : ""
                        }${actionResult}`;
                        break;
                    case "session-time-zone":
                        sessionTimeZone = actionResult;
                        break;
                }
            }

            let [startDate, endDate] = getDate(
                series.rounds.sessions.date,
                sessionDay,
                sessionStartTime,
                sessionEndTime,
                sessionGmtOffset,
                sessionTimeZone
            );
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
    } catch (error) {
        console.error("🚨 Error scraping '%s':", link, error);
        return null;
    }
};

const scrapeRoundAPI = async (
    series: ScraperSeries,
    round: any,
    index: number
): Promise<NewSession[] | null> => {
    try {
        let roundTitle = "",
            roundNumber = 0,
            roundCircuit = "",
            roundLink = "";

        for (const act of series.rounds.actions) {
            let actionResult: string;

            if (act.key === undefined) throw new Error("Undefined 'act.key'");
            actionResult = round[act.key];

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
                case "round-link":
                    roundLink = actionResult;
                    break;
                case "round-number":
                    roundNumber = Number(actionResult);
                    break;
            }
        }

        if (!roundTitle || !roundCircuit)
            throw new Error("No 'roundTitle' or 'roundCircuit' found");

        const { id: roundId } = await saveRound({
            title: roundTitle,
            number: roundNumber === 0 ? index + 1 : roundNumber,
            circuitTitle: roundCircuit,
            series: series.id,
            link: roundLink,
            season: String(series.season),
        });
        if (!roundId) throw new Error("No 'roundId' found");

        let newSessions: NewSession[] = [];

        const regex = /{([a-z\-]+)}/gi;
        const key = regex.exec(series.rounds.sessions.items.apiUrl!);
        const sessionUrlString = series.rounds.sessions.items.apiUrl!.replace(
            /{\w+}/gi,
            round[key![1]]
        );
        if (!sessionUrlString) throw new Error("");

        const sessionUrl = new URL(
            sessionUrlString + series.rounds.sessions.items.apiParams,
            series.baseUrl
        );

        const res = await fetch(sessionUrl);
        const data = (await res.json()) as Record<string, any>;

        const sessions = data[series.rounds.sessions.items.key!];
        for await (const s of sessions) {
            let sessionType: SessionType = "PRACTICE",
                sessionNumber = 0,
                sessionDay: string | null = null,
                sessionStartTime: string | null = null,
                sessionEndTime: string | null = null,
                sessionGmtOffset: string | null = null,
                sessionTimeZone: string | null = null;

            for (const act of series.rounds.sessions.actions) {
                let actionResult: string;

                if (act.key === undefined)
                    throw new Error("Undefined 'act.key'");
                actionResult = s[act.key];

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
                    case "session-day":
                        sessionDay = actionResult;
                        break;
                    case "session-start-time":
                        sessionStartTime = actionResult;
                        break;
                    case "session-end-time":
                        sessionEndTime = actionResult;
                        break;
                    case "session-gmt-offset":
                        if (
                            !actionResult.includes("+") &&
                            !actionResult.includes("-")
                        ) {
                            sessionGmtOffset = `+${actionResult}`;
                        } else {
                            sessionGmtOffset = actionResult;
                        }
                        // FIXME
                        if (sessionGmtOffset.length === 5) {
                            sessionGmtOffset = `-0${sessionGmtOffset.slice(1)}`;
                        }
                        break;
                    case "session-time-zone":
                        sessionTimeZone = actionResult;
                        break;
                }
            }

            let [startDate, endDate] = getDate(
                series.rounds.sessions.date,
                sessionDay,
                sessionStartTime,
                sessionEndTime,
                sessionGmtOffset,
                sessionTimeZone
            );
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
        // .sort((a, b) => a.startDate.valueOf() - b.startDate.valueOf())
        // .reduce((prevArr, curr, i, arr) => {
        //     if (prevArr.length > 1) {
        //         const currType = curr.type;
        //         const last = prevArr.findIndex((s) => s.type === currType);
        //         if (last !== -1) {
        //             let lastNum = prevArr[last].number;
        //             prevArr[last].number = lastNum === 0 ? 1 : lastNum;
        //             curr.number = lastNum === 0 ? 2 : lastNum++;
        //         }
        //     }
        //     return [...prevArr, curr];
        // }, [] as NewSession[]);
    } catch (error) {
        console.error("🚨 Error scraping '%s':", round, error);
        return null;
    }
};
