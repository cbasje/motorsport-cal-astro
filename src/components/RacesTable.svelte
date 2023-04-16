<script lang="ts">
    import type { Round, Session } from "@prisma/client";
    import { onMount } from "svelte";
    import type { SeriesId } from "../../lib/types";
    import SeriesMultiSelect from "./SeriesMultiSelect.svelte";

    type Race = Pick<Session, "id" | "startDate"> & {
        round: Pick<Round, "title" | "series">;
    };

    $: races = [] as Race[];
    $: includedSeries = [] as SeriesId[];

    const oneDay = 24 * 60 * 60 * 1000;
    const timeFormatter = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
        style: "short",
    });

    const getDaysDiff = (date: Date) => {
        const dateDate = new Date(date);
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((dateDate.valueOf() - Date.now()) / oneDay);
    };
    const getDateString = (date: Date) => {
        const diffDays = getDaysDiff(date);
        return timeFormatter.format(diffDays, "days");
    };

    const loadRaces = async () => {
        const res = await fetch("/api/all-races").then(
            async (r) => await r.json()
        );

        const data: Race[] = res.data;
        races = data;
    };

    onMount(() => {
        loadRaces();
    });
</script>

<SeriesMultiSelect bind:series={includedSeries} />

<table class="daisy-table w-full">
    <thead>
        <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Finished</th>
            <th>Sport</th>
        </tr>
    </thead>
    <tbody>
        {#each races as race (race.id)}
            <tr
                class:collapse={includedSeries.length > 0 &&
                    !includedSeries?.includes(race.round.series)}
            >
                <td>{race.round.title}</td>
                <td>
                    {getDateString(race.startDate)}
                </td>
                {#if getDaysDiff(race.startDate) <= -1}
                    <td>🏁</td>
                {:else if getDaysDiff(race.startDate) === 0}
                    <td>🏎️</td>
                {:else}
                    <td>-</td>
                {/if}
                <td>{race.round.series}</td>
            </tr>
        {:else}
            <tr>
                <td style="column-span: all">Nothing here!</td>
            </tr>
        {/each}
    </tbody>
</table>
