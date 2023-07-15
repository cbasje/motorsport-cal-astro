<script lang="ts">
    import { getSeriesTitle } from "lib/utils/series";
    import { trpc } from "../pages/client";
    import { getWeekend, relTime, trackTime, yourTime } from "lib/utils/date";

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
    <ul>
        {#each weekends as weekend}
            <li>
                <div>
                    <div>{weekend.title}</div>
                    <div>{getSeriesTitle(weekend.series)}</div>
                </div>

                <ol>
                    {#each weekend.sessions as session}
                        <li>
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
