<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import type { SeriesId } from "../../lib/types";
    import {
        getSeriesColour,
        getSeriesIcon,
        getSeriesTitle,
    } from "../../lib/utils/series";
    import SeriesMultiSelect from "./SeriesMultiSelect.svelte";
    import { trpc } from "src/pages/client";

    type Races = Awaited<ReturnType<typeof trpc.rounds.getAllRaces.query>>;
    let races = [] as Races;

    $: filteredRaces = races.filter(
        (r) =>
            !(
                includedSeries.length > 0 &&
                !includedSeries?.includes(r.round.series)
            )
    );
    $: nextRace = races
        .slice(0)
        .sort(
            (a, b) =>
                Math.abs(Date.now() - new Date(a.startDate).valueOf()) -
                Math.abs(Date.now() - new Date(b.startDate).valueOf())
        )[0];

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
    const parseDate = (date: Date) => {
        const diffDays = getDaysDiff(date);
        return timeFormatter.format(diffDays, "days");
    };

    const loadRaces = async () => {
        const data = await trpc.rounds.getAllRaces.query();
        races = data;
    };

    let tableRow: HTMLTableRowElement;
    onMount(async () => {
        await loadRaces();

        // tableRow.scrollIntoView();
        document
            .querySelector(`tr[data-id='${nextRace.id}']`)
            ?.scrollIntoView();
    });
</script>

<SeriesMultiSelect bind:series={includedSeries} />

<table>
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
            <tr data-id={race.id}>
                <td>{race.round.title}</td>
                <td>
                    {parseDate(race.startDate)}
                </td>
                {#if new Date(race.endDate).valueOf() < Date.now()}
                    <td>
                        <Icon icon="ph:flag-checkered-duotone" />
                    </td>
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

<style lang="scss">
    table {
        position: relative;
        text-align: left;
        text-indent: 0;
        border-color: inherit;
        border-collapse: collapse;
        width: 100%;

        th,
        td {
            white-space: nowrap;
            padding: 1rem;
            vertical-align: middle;
        }

        thead {
            th {
                --tw-bg-opacity: 1;
                background-color: hsl(
                    var(--b2, var(--b1)) / var(--tw-bg-opacity)
                );
                font-size: 0.75rem;
                line-height: 1rem;
                font-weight: 700;
                text-transform: uppercase;
            }
        }

        tbody {
            th,
            td {
                --tw-bg-opacity: 1;
                background-color: hsl(var(--b1) / var(--tw-bg-opacity));
            }

            tr:nth-child(even) {
                th,
                td {
                    --tw-bg-opacity: 1;
                    background-color: hsl(
                        var(--b2, var(--b1)) / var(--tw-bg-opacity)
                    );
                }
            }
        }

        tbody > tr {
            scroll-margin-top: 3rem;
        }
    }
</style>
