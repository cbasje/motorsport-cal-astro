import { load as loadCheerio } from "cheerio";
import fetch from "node-fetch";
import { saveRound, saveSessions } from "../api";
import type { SeriesId, SessionType } from "../types";
import type { NewSession } from "../types/api";
import type { ScraperSeries } from "../types/scraper";
import { flattenObject } from "../utils";
import {
    getAttr,
    getCircuitTitle,
    getDate,
    getKey,
    getText,
    getTitle,
    sessionAliases,
} from "../utils/scraper";
import scraperData from "./data";

export const main = async () => {
    try {
        console.time("Scraping...");
        await scrape();
        console.timeEnd("Scraping...");
    } catch (error) {
        console.error("main: ", error);
    }
};

const scrape = async () => {
    let includedSeries = import.meta.env.INCLUDED_SERIES.split(
        ","
    ) as SeriesId[];

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
                        s.baseApiUrl
                    );
                    let headers: Record<string, string> | undefined = {};
                    switch (s.rounds.link.apiKey?.envVariable) {
                        case "F1A_API_KEY":
                            headers[s.rounds.link.apiKey.headerKey] =
                                import.meta.env.F1A_API_KEY;
                            break;
                        case "F2_API_KEY":
                            headers[s.rounds.link.apiKey.headerKey] =
                                import.meta.env.F2_API_KEY;
                            break;
                        case "F3_API_KEY":
                            headers[s.rounds.link.apiKey.headerKey] =
                                import.meta.env.F3_API_KEY;
                            break;
                        default:
                            headers = undefined;
                            break;
                    }
                    console.log("🚀 ------------------------------🚀");
                    console.log("🚀 ~ scrape ~ headers:", { ...headers });
                    console.log("🚀 ------------------------------🚀");

                    res = await fetch(url, {
                        headers,
                    });

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
                    roundTitle = getTitle(actionResult, series.rounds.sponsors);
                    break;
                case "round-circuit":
                    roundCircuit = getCircuitTitle(actionResult);
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
    round: Record<string, any>,
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
            actionResult = getKey(flattenObject(round), act.key, act.regex);

            switch (act.param) {
                case "round-title":
                    roundTitle = getTitle(actionResult, series.rounds.sponsors);
                    break;
                case "round-circuit":
                    roundCircuit = getCircuitTitle(actionResult);
                    break;
                case "round-link":
                    roundLink = new URL(
                        actionResult,
                        series.baseUrl
                    ).toString();
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
        let data: Record<string, any>;

        // If not another call is needed, use the round JSON as data
        if (series.rounds.sessions.items.apiUrl) {
            const regex = /{([a-z\-]+)}/gi;
            const key = regex.exec(series.rounds.sessions.items.apiUrl);
            const sessionUrlString =
                series.rounds.sessions.items.apiUrl!.replace(
                    /{\w+}/gi,
                    round[key![1]]
                );
            if (!sessionUrlString) throw new Error("");

            const sessionUrl = new URL(
                sessionUrlString + series.rounds.sessions.items.apiParams,
                series.baseApiUrl
            );

            const res = await fetch(sessionUrl);
            data = (await res.json()) as Record<string, any>;
        } else {
            data = round;
        }

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
                actionResult = getKey(flattenObject(s), act.key, act.regex);

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
    } catch (error) {
        console.error("🚨 Error scraping '%s':", round, error);
        return null;
    }
};
