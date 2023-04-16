<script lang="ts">
    import type { Round, Session } from "@prisma/client";
    import { onMount } from "svelte";

    type NextRaceData = Pick<Session, "startDate"> & {
        round: Pick<Round, "title" | "series">;
    };

    $: nextRace = {
        date: new Date(),
        title: "",
        series: "",
    };

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
        mins = 0,
        secs = 0;
    $: {
        days =
            new Date(
                new Date(nextRace.date).valueOf() - currentDate.valueOf()
            ).getDate() - 1;
        hours =
            new Date(
                new Date(nextRace.date).valueOf() - currentDate.valueOf()
            ).getHours() - 1;
        mins = new Date(
            new Date(nextRace.date).valueOf() - currentDate.valueOf()
        ).getMinutes();
        secs = new Date(
            new Date(nextRace.date).valueOf() - currentDate.valueOf()
        ).getSeconds();
    }

    const loadNextRace = async () => {
        const res = await fetch("/api/next-race").then(
            async (r) => await r.json()
        );

        const data: NextRaceData = res.data;
        nextRace.date = data.startDate;
        nextRace.title = data.round.title;
        nextRace.series = data.round.series;
    };

    onMount(() => {
        loadNextRace();
    });
</script>

{#if nextRace.title !== ""}
    <h1 class="text-2xl font-medium">
        Time to: {nextRace.series}
        {nextRace.title}
    </h1>
{:else}
    <h1 class="text-2xl font-medium">Loading...</h1>
{/if}

<div class="grid grid-flow-col gap-5 text-center auto-cols-max">
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span
            class="daisy-countdown font-mono text-5xl"
            data-date-component="days"
        >
            <span style="--value: {days}" />
        </span>
        days
    </div>
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span
            class="daisy-countdown font-mono text-5xl"
            data-date-component="hours"
        >
            <span style="--value: {hours}" />
        </span>
        hours
    </div>
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span
            class="daisy-countdown font-mono text-5xl"
            data-date-component="mins"
        >
            <span style="--value: {mins}" />
        </span>
        mins
    </div>
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span
            class="daisy-countdown font-mono text-5xl"
            data-date-component="secs"
        >
            <span style="--value: {secs}" />
        </span>
        secs
    </div>
</div>
