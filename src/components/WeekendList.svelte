<script lang="ts">
    import Icon from "@iconify/svelte";
    import {
        getWeekend,
        relTime,
        trackTime,
        yourTime,
    } from "../../lib/utils/date";
    import {
        getSeriesHue,
        getSeriesIcon,
        getSeriesTitle,
    } from "../../lib/utils/series";
    import { trpc } from "../pages/client";

    let weekOffset = 0;
    let timeFormat: "track" | "your" | "rel" = "your";

    $: [startDate, endDate] = getWeekend(weekOffset);
</script>

{#await trpc.rounds.getWeekends.query({ startDate, endDate })}
    <h1>Loading weekends...</h1>
{:then weekends}
    <h1>
        {new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" }).format(
            weekOffset,
            "week"
        )}
    </h1>
    <ul class="round-list">
        {#each weekends as round (round.id)}
            <li>
                <div>
                    <span
                        class="icon"
                        title={getSeriesTitle(round.series)}
                        style="--icon-hue: {getSeriesHue(round.series)}"
                    >
                        <Icon
                            icon="fluent-emoji-high-contrast:{getSeriesIcon(
                                round.series
                            )}"
                        />
                    </span>
                    <div>{round.title}</div>
                    <div>{round.circuit.wikipediaTitle}</div>
                    <div>{getSeriesTitle(round.series)}</div>
                </div>

                <ol>
                    {#each round.sessions as session}
                        <li class:past={session.endDate.valueOf() < Date.now()}>
                            <div>{session.type} {session.number}</div>
                            <time datetime={session.startDate.toISOString()}>
                                {#if timeFormat === "track"}
                                    {trackTime(session.startDate)}
                                {:else if timeFormat === "your"}
                                    {yourTime(session.startDate)}
                                {:else}
                                    {relTime(session.startDate)}
                                {/if}
                            </time>
                        </li>
                    {/each}
                </ol>
            </li>
        {:else}
            <li>Nothing</li>
        {/each}
    </ul>
    <button
        on:click={() => {
            weekOffset--;
        }}
    >
        Previous
    </button>
    <button
        on:click={() => {
            weekOffset++;
        }}
    >
        Next
    </button>
{/await}

<style lang="scss">
    @import "../styles/oklch.scss";

    ul.round-list {
        > li {
            > div {
                span.icon {
                    --icon-chroma: 0.25;

                    > :global(svg.iconify) {
                        color: #{get-surface(5, "icon-chroma", "icon-hue")};
                    }
                }
            }

            > ol {
                > li {
                    &.past {
                        color: #{get-surface(5, "neutral-chroma", "neutral-hue")};
                    }
                }
            }
        }
    }
</style>
