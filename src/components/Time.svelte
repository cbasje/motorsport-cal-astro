<script lang="ts">
    import { onMount } from "svelte";
    import { relTime, trackTime, yourTime } from "../../lib/utils/date";

    export let timeZone: string | undefined = undefined;
    export let startDate: Date;
    export let endDate: Date | undefined = undefined;

    // FIXME: to store
    let timeFormat: "track" | "your" | "rel" = "your";

    let now = Date.now();

    // FIXME: can this be in store?
    onMount(() => {
        const dateInterval = setInterval(() => {
            now = Date.now();
        }, 60 * 1000);

        return { dateInterval };
    });
</script>

<time datetime={startDate.toISOString()}>
    {#if timeFormat === "track" && timeZone}
        {trackTime(timeZone, startDate, endDate)}
    {:else if timeFormat === "rel"}
        {relTime(startDate, now)}
    {:else}
        {yourTime(startDate, endDate)}
    {/if}
</time>
