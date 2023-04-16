<script lang="ts">
    import type { Round, Session } from "@prisma/client";
    import type { SeriesId } from "../../lib/types";
    import SeriesMultiSelect from "./SeriesMultiSelect.svelte";

    type MappedRound = Pick<Round, "id" | "title" | "series"> &
        Partial<Pick<Session, "startDate">> & { isFinished: string };

    export let rounds: MappedRound[];
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
        {#each rounds as round}
            <tr
                class:collapse={includedSeries &&
                    !includedSeries.includes(round.series)}
            >
                <td>{round.title}</td>
                <td>
                    {getDateString(new Date(round.startDate ?? ""))}
                </td>
                <td>{round.isFinished}</td>
                <td>{round.series}</td>
            </tr>
        {:else}
            <tr>
                <td style="column-span: all">Nothing here!</td>
            </tr>
        {/each}
    </tbody>
</table>
