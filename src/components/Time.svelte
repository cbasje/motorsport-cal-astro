<script lang="ts">
	import { timeFormat } from "$lib/stores/dateStore";
	import { relTime, trackTime, yourTime } from "$lib/utils/date";
	import { onMount } from "svelte";

	export let timeZone: string | undefined = undefined;
	export let start: Date;
	export let end: Date | undefined = undefined;

	let now = Date.now();

	// FIXME: can this be in store?
	onMount(() => {
		const dateInterval = setInterval(() => {
			now = Date.now();
		}, 60 * 1000);

		return { dateInterval };
	});
</script>

<time datetime={start.toISOString()}>
	{#if $timeFormat === "track" && timeZone}
		{trackTime(timeZone, start, end)}
	{:else if $timeFormat === "rel"}
		{relTime(start, now)}
	{:else}
		{yourTime(start, end)}
	{/if}
</time>
