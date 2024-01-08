import type { Round, Session } from "$db/types";
import _ from "lodash";

/**
	@param series Round.series
	@param season Round.season
	@param number Round.number
	@param title Round.title
 */
export const generateRoundId = (
	series: Round["series"],
	season: Round["season"],
	number: Round["number"],
	title: Round["title"]
) => `${series}-${season}-${number}`;
// ) => `${series}-${season}-${number}-${_.snakeCase(title)}`;

/**
	@param roundId
	@param type
	@param number
 */
export const generateSessionId = (
	roundId: Round["id"],
	type: Session["type"],
	number: Session["number"]
) => `${roundId}-${type}-r${number}`;
