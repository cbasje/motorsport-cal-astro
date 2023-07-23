<script lang="ts">
    import type { NextRace } from "../../lib/types";

    export let nextRace: NextRace;

    let currentDate = new Date();

    let ms = 1000;
    const incr = () => (currentDate = new Date());

    let clear: NodeJS.Timeout;
    $: {
        clearInterval(clear);
        clear = setInterval(incr, ms);
    }

    let days = 0,
        hours = 0,
        mins = 0;
    $: {
        days =
            new Date(
                nextRace.startDate.valueOf() - currentDate.valueOf()
            ).getDate() - 1;
        hours =
            new Date(
                nextRace.startDate.valueOf() - currentDate.valueOf()
            ).getHours() - 1;
        mins = new Date(
            nextRace.startDate.valueOf() - currentDate.valueOf()
        ).getMinutes();
    }
</script>

{#if nextRace.round.title !== ""}
    <h2>
        {nextRace.round.series}
        {nextRace.round.title}
    </h2>
{:else}
    <h1>Loading...</h1>
{/if}

<div class="countdown-counter">
    <div>
        <span class="countdown" aria-hidden="true">
            <span style="--value: {days}" />
        </span>
        <span class="visually-hidden">{days}</span>
        days
    </div>
    <div>
        <span class="countdown" aria-hidden="true">
            <span style="--value: {hours}" />
        </span>
        <span class="visually-hidden">{hours}</span>
        hours
    </div>
    <div>
        <span class="countdown" aria-hidden="true">
            <span style="--value: {mins}" />
        </span>
        <span class="visually-hidden">{mins}</span>
        mins
    </div>
</div>

<style lang="scss">
    h1 {
        font-size: var(--font-size-5);
        line-height: var(--font-lineheight-3);
        font-weight: var(--font-weight-7);
    }

    .countdown-counter {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: max-content;
        gap: var(--size-4);

        text-align: center;

        > div {
            display: flex;
            flex-direction: column;

            padding: var(--size-2);
            border-radius: var(--radius-3);

            background-color: var(--surface-2);
        }
    }

    .countdown {
        line-height: 1em;
        font-size: var(--font-size-7);

        > * {
            height: 1em;
            display: inline-block;
            overflow-y: hidden;
        }
        > *:before {
            position: relative;
            content: "00\A 01\A 02\A 03\A 04\A 05\A 06\A 07\A 08\A 09\A 10\A 11\A 12\A 13\A 14\A 15\A 16\A 17\A 18\A 19\A 20\A 21\A 22\A 23\A 24\A 25\A 26\A 27\A 28\A 29\A 30\A 31\A 32\A 33\A 34\A 35\A 36\A 37\A 38\A 39\A 40\A 41\A 42\A 43\A 44\A 45\A 46\A 47\A 48\A 49\A 50\A 51\A 52\A 53\A 54\A 55\A 56\A 57\A 58\A 59\A 60\A 61\A 62\A 63\A 64\A 65\A 66\A 67\A 68\A 69\A 70\A 71\A 72\A 73\A 74\A 75\A 76\A 77\A 78\A 79\A 80\A 81\A 82\A 83\A 84\A 85\A 86\A 87\A 88\A 89\A 90\A 91\A 92\A 93\A 94\A 95\A 96\A 97\A 98\A 99\A";
            white-space: pre;
            top: calc(var(--value) * -1em);
            text-align: center;
            transition: all 1s cubic-bezier(1, 0, 0, 1);
        }
    }
</style>
