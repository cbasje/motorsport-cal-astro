<script lang="ts">
    import type { Round, Session } from "@prisma/client";
    import { onMount } from "svelte";
    import type { SeriesId } from "../../lib/types";
    import SeriesMultiSelect from "./SeriesMultiSelect.svelte";

    type Race = Pick<Session, "id" | "startDate"> & {
        round: Pick<Round, "title" | "series">;
        isFinished: string;
    };

    $: races = [] as Race[];
    $: includedSeries = [] as SeriesId[];

    const timeFormatter = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
        style: "short",
    });

    const getDateString = (date: Date) => {
        const oneDay = 24 * 60 * 60 * 1000;

        const diffDays = Math.round((date.valueOf() - Date.now()) / oneDay);
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
                    {getDateString(new Date(race.startDate ?? ""))}
                </td>
                <td>{race.isFinished}</td>
                <td>{race.round.series}</td>
            </tr>
        {:else}
            <tr>
                <td style="column-span: all">Nothing here!</td>
            </tr>
        {/each}
    </tbody>
</table>
