<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import {
        getWeekend,
        relTime,
        trackTime,
        yourTime,
    } from "../../lib/utils/date";
    import { trpc } from "../pages/client";
    import { getSessionTitle } from "../../lib/utils/sessions";
    import {
        getSeriesIcon,
        getSeriesTitle,
        getSeriesTitleShort,
    } from "../../lib/utils/series";

    let weekOffset = 0;
    let timeFormat: "track" | "your" | "rel" = "your";

    $: [startDate, endDate] = getWeekend(weekOffset);
    let now = Date.now();

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        weekOffset = Number(params.get("w"));

        const dateInterval = setInterval(() => {
            now = Date.now();
        }, 60 * 1000);

        return { dateInterval };
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
            {@const nextSession = round.sessions.find(
                (s) => s.endDate.valueOf() > now
            )}
            <li
                role="listitem"
                style="--color-hue: var(--{round.series}-hue)"
                class:past={round.sessions.every(
                    (s) => s.endDate.valueOf() < now
                )}
            >
                <a class="round-header button" href="/round/{round.id}">
                    <div class="round-title">
                        <Icon
                            icon="fluent-emoji-high-contrast:{getSeriesIcon(
                                round.series
                            )}"
                        />
                        <h2>{round.title}</h2>
                        <div>
                            {getSeriesTitleShort(round.series)} @ {round.circuit
                                .wikipediaTitle}
                        </div>
                    </div>

                    {#if nextSession}
                        <div class="next-session">
                            <Icon icon="ph:arrow-line-right-bold" />
                            <span>
                                {getSessionTitle(
                                    nextSession.type,
                                    nextSession.number
                                )}
                            </span>
                            <time
                                datetime={nextSession.startDate.toISOString()}
                            >
                                {#if timeFormat === "track"}
                                    {trackTime(nextSession.startDate)}
                                {:else if timeFormat === "your"}
                                    {yourTime(
                                        nextSession.startDate,
                                        nextSession.endDate
                                    )}
                                {:else}
                                    {relTime(nextSession.startDate, now)}
                                {/if}
                            </time>
                        </div>
                    {/if}
                </a>

                <!-- <ol role="list">
                    {#each round.sessions as session}
                        <li
                            class:past={session.endDate.valueOf() < now}
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
                </ol> -->
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
    h1 {
        text-transform: capitalize;
    }

    .round-list {
        display: flex;
        flex-direction: column;
        gap: var(--size-7);

        padding: 0;
        list-style: none;

        > li {
            padding: 0;

            :global(*) {
                --color-hue: inherit;
            }

            > .round-header {
                background: var(--color-5);
                color: var(--text-on-accent);
                border-radius: var(--radius-4);
                border: var(--color-3) var(--border-size-3) solid;
                box-shadow: var(--color-3) 0px var(--border-size-4) 0px;

                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: var(--size-3);
                padding: var(--size-4);

                isolation: isolate;
                position: relative;
                overflow: hidden;

                &:hover {
                    text-decoration: none;
                    background: var(--color-4);
                    border-color: var(--color-3);
                }

                > .round-title > :global(.iconify) {
                    color: var(--color-7);
                    font-size: 12rem;

                    position: absolute;
                    top: -3rem;
                    right: -2.5rem;
                    z-index: -1;
                }

                > .next-session {
                    background: var(--gray-0);
                    color: var(--color-7);
                    border-radius: var(--radius-3);

                    display: flex;
                    flex-direction: row;
                    gap: var(--size-2);
                    padding: var(--size-1) var(--size-3);
                }
            }

            &.past {
                .round-header {
                    opacity: 0.5;
                }
            }
        }
    }
</style>
