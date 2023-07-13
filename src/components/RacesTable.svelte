<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import type { SeriesId } from "../../lib/types";
    import {
        getSeriesHue,
        getSeriesIcon,
        getSeriesTitle,
    } from "../../lib/utils/series";
    import SeriesMultiSelect from "./SeriesMultiSelect.svelte";
    import { trpc } from "../pages/client";

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
                    <span
                        class="icon"
                        title={getSeriesTitle(race.round.series)}
                        style="--icon-hue: {getSeriesHue(race.round.series)}"
                    >
                        <Icon
                            icon="fluent-emoji-high-contrast:{getSeriesIcon(
                                race.round.series
                            )}"
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
    @import "../styles/oklch.scss";

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
            padding: var(--size-3);
            vertical-align: middle;
        }

        thead {
            th {
                background-color: var(--theme-surface-2);
                font-size: var(--font-size-0);
                line-height: var(--font-lineheight-1);
                font-weight: var(--font-weight-7);
                text-transform: uppercase;
            }
        }

        tbody {
            th,
            td {
                background-color: var(--theme-surface-1);

                span.icon {
                    --icon-chroma: 0.25;

                    > :global(svg.iconify) {
                        color: #{get-surface(5, "icon-chroma", "icon-hue")};
                    }
                }
            }

            tr:nth-child(even) {
                th,
                td {
                    background: var(--theme-surface-2);
                }
            }
        }

        tbody > tr {
            scroll-margin-top: var(--size-8);
        }
    }
</style>
