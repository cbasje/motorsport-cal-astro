import {
    Handler,
    HandlerEvent,
    HandlerContext,
    schedule,
} from "@netlify/functions";
import { main } from "@/lib/scraper";

const scrapeHandler: Handler = async (
    event: HandlerEvent,
    context: HandlerContext
) => {
    await main();

    return {
        statusCode: 200,
    };
};

// const handler = schedule("0 0 * * FRI,SAT,SUN", scrapeHandler);
const handler = schedule("@daily", scrapeHandler);

export { handler };
