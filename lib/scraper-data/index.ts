import type { ScraperSeries } from "../types/scraper";

import f1 from "./f1.json";
import f1a from "./f1a.json";
import f2 from "./f2.json";
import fe from "./fe.json";
import indy from "./indy.json";
import w from "./w.json";
import wec from "./wec.json";
import xe from "./xe.json";

// export default [f1, f1a, f2, fe, indy, w, wec, xe] as ScraperSeries[];
export default [f1, fe, indy] as ScraperSeries[];

const s: ScraperSeries[] = [
    {
        id: "FE",
        baseUrl: "https://api.formula-e.pulselive.com/formula-e/v1/",
        season: 2023,

        rounds: {
            link: {
                type: "api",
                apiUrl: "races",
                apiParams:
                    "?championshipId=bc4a0209-f233-46c8-afce-842d1c48358f",
                key: "races",
            },
            actions: [
                {
                    param: "round-title",
                    type: "key",
                    key: "name",
                    regex: "20\\d\\d (\\b[\\w ]+ E-Prix)",
                },
                {
                    param: "round-number",
                    type: "key",
                    key: "sequence",
                },
                {
                    param: "round-circuit",
                    type: "key",
                    key: "city",
                },
                {
                    param: "round-link",
                    type: "key",
                    key: "metadata.racePath",
                },
            ],
            sessions: {
                items: {
                    type: "api",
                    apiUrl: "races/{id}/sessions",
                    apiParams: "?groupQualifyings=true&onlyActualEvents=true",
                    key: "sessions",
                },
                date: {
                    start: "{session-day}T{session-start-time}:00GMT{session-gmt-offset}",
                    end: "{session-day}T{session-end-time}:00GMT{session-gmt-offset}",
                },
                actions: [
                    {
                        param: "session-title",
                        type: "key",
                        key: "sessionName",
                    },
                    {
                        param: "session-day",
                        type: "key",
                        key: "sessionDate",
                    },
                    {
                        param: "session-start-time",
                        type: "key",
                        key: "startTime",
                    },
                    {
                        param: "session-end-time",
                        type: "key",
                        key: "finishTime",
                    },
                    {
                        param: "session-gmt-offset",
                        type: "key",
                        key: "offsetGMT",
                    },
                ],
            },
        },
    },
    {
        id: "F1",
        baseUrl: "https://www.formula1.com",
        season: 2023,

        rounds: {
            url: "en/racing/2023.html",
            selector: ".completed-events > div:not(.seo-wrapper)",
            link: {
                type: "attr",
                attr: "href",
                selector: "a.event-item-link",
            },
            actions: [
                {
                    param: "round-title",
                    type: "text",
                    selector: "title",
                    regex: "(\\b[\\w ]+ Grand Prix)|(Pre-Season Testing)",
                },
                {
                    param: "round-circuit",
                    type: "text",
                    selector: ".f1-race-hub--timetable-links-wrapper p",
                },
            ],
            sessions: {
                items: {
                    type: "contents",
                    selector: "div.f1-race-hub--timetable-listings > div.row",
                },
                date: {
                    start: "{session-start-time}GMT{session-gmt-offset}",
                    end: "{session-end-time}GMT{session-gmt-offset}",
                },
                actions: [
                    {
                        param: "session-title",
                        type: "text",
                        selector:
                            "div.f1-timetable--details > p.f1-timetable--title",
                    },
                    {
                        param: "session-start-time",
                        type: "attr",
                        attr: "data-start-time",
                    },
                    {
                        param: "session-end-time",
                        type: "attr",
                        attr: "data-end-time",
                    },
                    {
                        param: "session-gmt-offset",
                        type: "attr",
                        attr: "data-gmt-offset",
                    },
                ],
            },
        },
    },
    {
        id: "INDY",
        baseUrl: "https://www.indycar.com/",
        season: 2023,

        rounds: {
            url: "Schedule",
            selector: ".schedule-list ul > .schedule-list__item",
            link: {
                type: "attr",
                attr: "href",
                selector: ".schedule-list__links > a:last-child",
            },
            actions: [
                {
                    param: "round-title",
                    type: "text",
                    selector: "title",
                },
                {
                    param: "round-circuit",
                    type: "attr",
                    attr: "content",
                    selector: "meta[property='og:url']",
                    regex: "IndyCar-Series/([\\w-]+)\\b",
                },
            ],
            sessions: {
                items: {
                    type: "contents",
                    selector: "#schedule .race-list > .race-list__item",
                },
                date: {
                    start: "{session-day} 2023 {session-start-time}:00 {session-time-zone}",
                    end: "{session-day} 2023 {session-end-time}:00 {session-time-zone}",
                },
                actions: [
                    {
                        param: "session-title",
                        type: "text",
                        selector: "div.race-list__race",
                    },
                    {
                        param: "session-day",
                        type: "text",
                        selector: ".race-list__date",
                    },
                    {
                        param: "session-start-time",
                        type: "text",
                        selector: ".race-list__time",
                        regex: "(\\d{1,2}:\\d{1,2})\\s?[PM|AM]{2}\\s?-\\s?",
                    },
                    {
                        param: "session-end-time",
                        type: "text",
                        selector: ".race-list__time",
                        regex: "\\s?-\\s?(\\d{1,2}:\\d{1,2})\\s?[PM|AM]{2}",
                    },
                    {
                        param: "session-time-zone",
                        type: "text",
                        selector: ".race-list__time",
                        regex: "[PM|AM]{2}\\s?([A-Z]{1,4})\\s?",
                    },
                ],
            },
        },
    },
];
