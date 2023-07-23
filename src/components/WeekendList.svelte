<script lang="ts">
    import Icon from "@iconify/svelte";
    import { getSessionTitle } from "lib/utils/sessions";
    import { onMount } from "svelte";
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

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        weekOffset = Number(params.get("w"));
    });
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
    <ul class="round-list" role="list">
        {#each weekends as round (round.id)}
            <li role="listitem">
                <div
                    class="round-header"
                    style="--color-hue: var(--{round.series}-hue)"
                >
                    <Icon
                        icon="fluent-emoji-high-contrast:{getSeriesIcon(
                            round.series
                        )}"
                    />
                    <h2>
                        {getSeriesTitle(round.series)}
                    </h2>
                    <div>{round.title}</div>
                    <div>{round.circuit.wikipediaTitle}</div>
                </div>

                <ol role="list">
                    {#each round.sessions as session}
                        <li
                            class:past={session.endDate.valueOf() < Date.now()}
                            role="listitem"
                        >
                            <h3>
                                {getSessionTitle(session.type, session.number)}
                            </h3>
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
            <li role="listitem">Nothing</li>
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
    .round-list {
        list-style: none;
        padding: 0;

        > li {
            padding: 0;

            > .round-header {
                background: var(--color-1);

                > :global(svg.iconify) {
                    color: var(--color-bright);
                }
            }

            > ol {
                list-style: none;
                padding: 0;

                > li {
                    padding: 0;

                    &.past {
                        opacity: 0.5;
                    }
                }
            }
        }
    }
</style>
