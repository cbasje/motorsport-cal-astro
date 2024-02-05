import { ValiError } from "valibot";

export class CustomError extends Error {
	status: number;

	constructor(message: string, status: number = 200) {
		super(message);
		this.name = "CustomError";
		this.status = status;
	}
}

export const feedRes = (feed: string) => {
	console.debug("🗓️");
	return new Response(feed, {
		status: 200,
		headers: {
			"Content-Type": "text/calendar",
		},
	});
};

export const manifestRes = (manifest: object) => {
	console.debug("⚙️");
	return new Response(JSON.stringify(manifest), {
		status: 200,
		headers: {
			"Content-Type": "application/manifest+json",
		},
	});
};

export const imageRes = (buffer: Buffer) => {
	console.debug("🖼️");
	return new Response(buffer, {
		status: 200,
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "s-maxage=1, stale-while-revalidate=59",
		},
	});
};

export const svgRes = (svg: string) => {
	console.debug("🖼️⌨️");
	return new Response(svg, {
		status: 200,
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "s-maxage=1, stale-while-revalidate=59",
		},
	});
};

export const successRes = (error_?: unknown, emoji: string = "✅", data?: object) => {
	if (error_ instanceof CustomError) {
		console.debug(emoji, error_.message);
		return new Response(
			JSON.stringify({
				success: error_.status >= 200 && error_.status <= 299,
				message: error_.message,
				data,
			}),
			{
				status: error_.status,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
	if (error_ instanceof ValiError) {
		console.debug(emoji, error_.message);
		return new Response(
			JSON.stringify({
				success: false,
				message: error_.message,
			}),
			{
				status: 401,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	return errorRes(error_, emoji, data);
};

export const debugRes = (error_: unknown, emoji: string, data?: object) => {
	if (error_ instanceof CustomError) {
		console.debug(emoji, error_.message);
		return new Response(
			JSON.stringify({
				success: error_.status >= 200 && error_.status <= 299,
				message: error_.message,
				data,
			}),
			{
				status: error_.status,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	return errorRes(error_, emoji, data);
};

export const errorRes = (error_: unknown, emoji: string = "🚨", data?: object) => {
	console.error(emoji, error_);
	return new Response(
		JSON.stringify({
			success: false,
			message: error_ instanceof Error || error_ instanceof CustomError ? error_.message : "",
			data,
		}),
		{
			status: error_ instanceof CustomError ? error_.status : 500,
			headers: { "Content-Type": "application/json" },
		}
	);
};
