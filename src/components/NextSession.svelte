<script lang="ts">
	import { useQuery } from "@sveltestack/svelte-query";
	import { getSessionTitle } from "$lib/utils/sessions";
	import { onMount } from "svelte";
	import Time from "./Time.svelte";
	import type { Circuit, Round, Session } from "$db/types";

	type NextSession = {
		type: Session["type"];
		start: Session["start"];
		end: Session["end"];
		number: Session["number"];
		series: Round["series"];
		timezone: Circuit["timezone"];
	};

	let now = new Date();
	export let roundId: number;

	const url = new URL("/api/next-session", "http://localhost:3000");
	url.searchParams.set("now", now.toISOString());
	url.searchParams.set("roundId", String(roundId));

	const queryResult = useQuery(
		"nextSession",
		async () => {
			const res = await fetch(url, { method: "GET" });
			const { data } = await res.json();
			if (!data) return undefined;
			return {
				...data,
				start: data.start ? new Date(data.start) : undefined,
				end: data.end ? new Date(data.end) : undefined,
			} as NextSession;
		},
		{ refetchOnWindowFocus: false }
	);

	onMount(() => {
		const nowInterval = setInterval(
			() => {
				now = new Date();
			},
			5 * 60 * 1000
		);

		return nowInterval;
	});
</script>

{#if $queryResult.isLoading}
	<!-- <div class="next-session">
        <span>Loading...</span>
{:else if $queryResult.error}
        <span>An error has occurred: {$queryResult.error.message}</span>
    </div> -->
{:else if $queryResult.data}
	<div class="next-session">
		{#if $queryResult.data.start.valueOf() >= now.valueOf()}
			<slot name="icon-future" />
		{:else}
			<slot name="icon-now" />
			<span>...</span>
		{/if}
		<span>
			{getSessionTitle(
				$queryResult.data.series,
				$queryResult.data.type,
				$queryResult.data.number
			)}
		</span>
		<Time start={$queryResult.data.start} timeZone={$queryResult.data.timezone ?? undefined} />
	</div>
{/if}

<style lang="postcss">
	.next-session {
		background: var(--gray-0);
		color: var(--color-7);
		border-radius: var(--radius-3);

		display: flex;
		flex-direction: row;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-3);
	}
</style>
