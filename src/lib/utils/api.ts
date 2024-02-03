import { lucia } from "$lib/auth";

export const getApiKey = (url: URL, headers: Headers) => {
	// Get apiKey from url searchParams
	const apiKeyFromSearch = url.searchParams.get("apiKey") || url.searchParams.get("api_key");

	// Get apiKey from bearer token
	const authorizationHeader = headers.get("Authorization");
	const apiKeyFromBearer = lucia.readBearerToken(authorizationHeader ?? "");

	return apiKeyFromSearch ?? apiKeyFromBearer;
};
