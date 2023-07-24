<script lang="ts">
    import { onMount } from "svelte";
    import { relTime, trackTime, yourTime } from "../../lib/utils/date";

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
    {#if timeFormat === "track"}
        {trackTime(startDate)}
    {:else if timeFormat === "your"}
        {yourTime(startDate, endDate)}
    {:else}
        {relTime(startDate, now)}
    {/if}
</time>
