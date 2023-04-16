<script lang="ts">
    import type { Round, Session } from "@prisma/client";
    import { onMount } from "svelte";
    import type { SeriesId } from "../../lib/types";
    import SeriesMultiSelect from "./SeriesMultiSelect.svelte";
    import {
        getSeriesColour,
        getSeriesIcon,
        getSeriesTitle,
    } from "../../lib/utils";
    import Icon from "@iconify/svelte";

    type Race = Pick<Session, "id" | "startDate" | "endDate"> & {
        round: Pick<Round, "title" | "series">;
    };

    let races = [] as Race[];
    $: filteredRaces = races.filter(
        (r) =>
            !(
                includedSeries.length > 0 &&
                !includedSeries?.includes(r.round.series)
            )
    );
    $: includedSeries = [] as SeriesId[];

    const oneDay = 24 * 60 * 60 * 1000;
    const timeFormatter = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
        style: "short",
    });

    const getDaysDiff = (date: Date) => {
        const dateDate = new Date(date);
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

<table class="daisy-table daisy-table-zebra w-full">
    <thead>
        <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Finished</th>
            <th>Sport</th>
        </tr>
    </thead>
    <tbody>
        {#each filteredRaces as race (race.id)}
            <tr>
                <td>{race.round.title}</td>
                <td>
                    {getDateString(race.startDate)}
                </td>
                {#if new Date(race.endDate).valueOf() < Date.now()}
                    <td>🏁</td>
                {:else if Date.now() >= new Date(race.startDate).valueOf() && Date.now() <= new Date(race.endDate).valueOf()}
                    <td>...</td>
                {:else}
                    <td>-</td>
                {/if}
                <td>
                    <span title={getSeriesTitle(race.round.series)}>
                        <Icon
                            icon="fluent-emoji-high-contrast:{getSeriesIcon(
                                race.round.series
                            )}"
                            color={getSeriesColour(race.round.series)}
                        />
                    </span>
                </td>
            </tr>
        {:else}
            <tr>
                <td style="column-span: all">Nothing here!</td>
            </tr>
        {/each}
    </tbody>
</table>
