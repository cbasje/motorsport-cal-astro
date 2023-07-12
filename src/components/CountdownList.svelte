<script lang="ts">
    import { trpc } from "../pages/client";
    import Countdown from "./Countdown.svelte";
</script>

{#await trpc.rounds.getNextRaces.query()}
    <h1>Loading countdown...</h1>
{:then nextRaces}
    <h1>Time until</h1>
    <ul role="list">
        {#each nextRaces.sort((a, b) => (a?.startDate.valueOf() ?? 0) - (b?.startDate.valueOf() ?? 0)) as race}
            {#if race !== null}
                <li role="listitem">
                    <Countdown nextRace={race} />
                </li>
            {/if}
        {/each}
    </ul>
{/await}
