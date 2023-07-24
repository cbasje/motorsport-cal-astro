<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import { getWeekend } from "../../lib/utils/date";
    import { getSeriesIcon, getSeriesTitleShort } from "../../lib/utils/series";
    import { getSessionTitle } from "../../lib/utils/sessions";
    import { trpc } from "../pages/client";
    import Time from "./Time.svelte";

    let weekOffset = 0;
    const now = Date.now();

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
                            <Time startDate={nextSession.startDate} />
                        </div>
                    {/if}
                </a>
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
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: var(--size-3);
                padding: var(--size-4);

                isolation: isolate;
                position: relative;
                overflow: hidden;

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
