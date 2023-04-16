import { load as loadCheerio } from "cheerio";
import { DateTime } from "luxon";
import fetch from "node-fetch";
import {
    CircuitTitle,
    NewSession,
    SessionType,
    Series,
    SeriesId,
} from "./types";

import { saveRound, saveSessions } from "./api";
import series from "./series";

const sessionAliases: Record<SessionType, string> = {
    SHAKEDOWN: "((?:Pre-Season|Session|Day)( \\d)?)",
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

const getDate = (
    source: string | undefined,
    gmtOffset: string | undefined,
    plusHours = 0
): Date | undefined => {
    return source && source != "TBC"
        ? DateTime.fromISO(source + gmtOffset, { zone: "utc" })
              .plus({ hours: plusHours })
              .toJSDate()
        : undefined;
};
const getDatesFromString = (source: string, season: string) => {
    const string = source.trim();

    const regexTimes = /(\d{1,2}:\d{1,2} \w+)/g;
    const times = [...string.matchAll(regexTimes)];

    const startTime = times[0][0];
    const endTime = times[1][0];

    const regexDate = /(\w{3} \d{1,2})/g;
    const date = string.match(regexDate)![0];

    const regexTimeZone = /(\w+)$/g;
    const timeZone = string.match(regexTimeZone)![0];

    const startDate = `${date}, ${season}, ${startTime}`;
    const endDate = `${date}, ${season}, ${endTime}`;

    return [
        DateTime.fromFormat(startDate, "ff", {
            zone: "America/New_York",
        }).toJSDate(),
        DateTime.fromFormat(endDate, "ff", {
            zone: "America/New_York",
        }).toJSDate(),
    ];
};

const scrape = async () => {
    let includedSeries: SeriesId[] = ["F1", "INDY"];

    for (const s of series) {
        if (includedSeries.length && !includedSeries.includes(s.id)) continue;

        const url = new URL(s.url, s.baseURL);

        try {
            const res = await fetch(url);
            const html = await res.text();

            const $ = loadCheerio(html);

            let sessions: NewSession[] = [];

            let i = 0;
            const elements = $(s.list, html);
            for await (const el of elements) {
                // console.log(i++, s.id);

                const linkString = $(el).find(s.redirectURLItem).attr("href");
                const link = new URL(
                    linkString ?? "" + s.redirectURLExtension,
                    s.baseURL
                );

                if (
                    s.excludedURLs &&
                    s.excludedURLs.some((url: string) =>
                        link.toString().includes(url)
                    )
                )
                    continue;

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
    s: Series,
    link: URL
): Promise<NewSession[] | null> => {
    try {
        const res = await fetch(link);
        const subHtml = await res.text();

        const sub$ = loadCheerio(subHtml);

        let roundTitle = "";
        if (s.roundItems.title) {
            roundTitle = sub$(s.roundItems.title, subHtml).first().text();
        } else if (s.roundItems.titleAttr) {
            // @ts-ignore
            roundTitle = sub$(s.roundItems.titleAttr.main, subHtml)
                .attr(s.roundItems.titleAttr.title)
                .trim();
        }
        if (s.roundItems.titleRegex) {
            const matches = roundTitle.match(
                new RegExp(s.roundItems.titleRegex, "i")
            );
            roundTitle = matches && matches[1] ? matches[1].trim() : "";
        }

        let roundCircuit = "";
        if (s.roundItems.circuit) {
            roundCircuit = sub$(s.roundItems.circuit, subHtml).first().text();
        } else if (s.roundItems.circuitAttr) {
            // @ts-ignore
            roundCircuit = sub$(s.roundItems.circuitAttr.main, subHtml)
                .attr(s.roundItems.circuitAttr.circuit)
                .trim();
        }
        if (s.roundItems.circuitRegex) {
            const matches = roundCircuit.match(
                new RegExp(s.roundItems.circuitRegex, "i")
            );
            roundCircuit = matches && matches[1] ? matches[1].trim() : "";
        }

        if (!roundTitle || !roundCircuit) return null;

        for (const alias in circuitAliases) {
            const regexString = circuitAliases[alias as CircuitTitle];
            const regex = new RegExp(regexString, "gi");

            if (regex.test(roundCircuit)) {
                roundCircuit = alias;
                break;
            }
        }

        const { id: roundId } = await saveRound({
            title: roundTitle,
            circuitTitle: roundCircuit,
            series: s.id,
            link: link.toString(),
            season: s.season,
        });
        if (!roundId) return null;

        let sessions: NewSession[] = [];

        const subElements = sub$(s.sessionList, subHtml);
        for await (const el of subElements) {
            let titleAliasFound = false;

            let sessionType = "";
            let sessionNumber = 0;
            if (s.sessionItems.title) {
                sessionType = sub$(el)
                    .find(s.sessionItems.title)
                    .first()
                    .text();
            } else if (s.sessionItems.titleAttr) {
                // @ts-ignore
                sessionType = sub$(el)
                    .find(s.sessionItems.titleAttr.main)
                    .attr(s.sessionItems.titleAttr.title)
                    .trim();
            }

            for (const alias in sessionAliases) {
                const regexString = sessionAliases[alias as SessionType];
                const regex = new RegExp(regexString, "gi");

                if (regex.test(sessionType)) {
                    const numbers = sessionType.match(/\b\d?\b/gi);
                    const filteredNumbers = numbers?.filter((n) => n != "");
                    sessionNumber =
                        filteredNumbers && filteredNumbers[0]
                            ? Number(filteredNumbers[0])
                            : 0;

                    titleAliasFound = true;
                    sessionType = alias;
                    break;
                }
            }
            if (!titleAliasFound) continue;

            let startDateString: string | undefined = "",
                endDateString: string | undefined = "",
                gmtOffsetString: string | undefined = "",
                startDate: Date | undefined,
                endDate: Date | undefined;
            if (s.sessionItems.dateAttr && s.sessionItems.dateAttr.main) {
                startDateString = sub$(el)
                    .find(s.sessionItems.dateAttr.main)
                    .attr(s.sessionItems.dateAttr.startDate);
                endDateString = s.sessionItems.dateAttr.endDate
                    ? sub$(el)
                          .find(s.sessionItems.dateAttr.main)
                          .attr(s.sessionItems.dateAttr.endDate)
                    : "";
                gmtOffsetString = s.sessionItems.dateAttr.gmtOffset
                    ? sub$(el)
                          .find(s.sessionItems.dateAttr.main)
                          .attr(s.sessionItems.dateAttr.gmtOffset)
                    : "";

                startDate = getDate(startDateString, gmtOffsetString);
                endDate = endDateString
                    ? getDate(endDateString, gmtOffsetString)
                    : getDate(startDateString, gmtOffsetString, 2);
            } else if (s.sessionItems.dateAttr) {
                startDateString = sub$(el).attr(
                    s.sessionItems.dateAttr.startDate
                );
                endDateString = s.sessionItems.dateAttr.endDate
                    ? sub$(el).attr(s.sessionItems.dateAttr.endDate)
                    : "";
                gmtOffsetString = s.sessionItems.dateAttr.gmtOffset
                    ? sub$(el).attr(s.sessionItems.dateAttr.gmtOffset)
                    : "";

                startDate = getDate(startDateString, gmtOffsetString);
                endDate = endDateString
                    ? getDate(endDateString, gmtOffsetString)
                    : getDate(startDateString, gmtOffsetString, 2);
            } else if (s.sessionItems.dateText) {
                const dates = getDatesFromString(
                    sub$(el).find(s.sessionItems.dateText.date).text() +
                        " " +
                        sub$(el).find(s.sessionItems.dateText.time).text(),
                    s.season
                );
                startDate = dates[0];
                endDate = dates[1];
            }

            if (startDate && endDate) {
                sessions.push({
                    type: sessionType as SessionType,
                    number: sessionNumber,
                    startDate,
                    endDate,
                    roundId,
                });
            }
        }

        return sessions;
    } catch (error: any) {
        console.error("🚨 Error scraping '%s':", link, error.message);
        return null;
    }
};
