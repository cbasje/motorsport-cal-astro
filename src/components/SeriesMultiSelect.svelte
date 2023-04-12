<script lang="ts">
    import { Sport } from "@prisma/client";
    import { onMount } from "svelte";

    export let sports: Sport[];

    let sportsCopy: Sport[];

    type SportMetadata = { sport: Sport; title: string; class: string[] };
    const metadata: SportMetadata[] = [
        {
            sport: Sport.F1,
            title: "Formula 1",
            class: ["peer/f1", "peer-checked/f1:btn-primary"],
        },
        {
            sport: Sport.FE,
            title: "Formula E",
            class: ["peer/fe", "peer-checked/fe:btn-primary"],
        },
        {
            sport: Sport.XE,
            title: "Extreme E",
            class: ["peer/xe", "peer-checked/xe:btn-primary"],
        },
        {
            sport: Sport.INDY,
            title: "Indycar",
            class: ["peer/indy", "peer-checked/indy:btn-primary"],
        },
        {
            sport: Sport.W,
            title: "W Series",
            class: ["peer/w", "peer-checked/w:btn-primary"],
        },
        {
            sport: Sport.WEC,
            title: "WEC",
            class: ["peer/wec", "peer-checked/wec:btn-primary"],
        },
    ];

    const reset = () => {
        sports = sportsCopy.slice(0);
    };
    onMount(() => {
        sportsCopy = sports.slice(0);
    });
</script>

<div class="flex w-full">
    <button class="btn btn-square btn-active btn-ghost" on:click={reset}>
        Toggle
    </button>
    <div class="divider divider-horizontal" />
    {#each metadata as s}
        <input
            type="checkbox"
            bind:group={sports}
            value={s.sport}
            id="{s.title}-check"
            class="hidden {s.class[0]}"
        />
        <label
            for="{s.title}-check"
            class="btn btn-active btn-ghost {s.class[1]}"
        >
            {s.title}
        </label>
    {:else}
        <p>Nothing</p>
    {/each}
</div>
