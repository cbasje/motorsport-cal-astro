<script lang="ts">
    import { onMount } from "svelte";
    import type { SportId } from "../../lib/types";

    export let sports: SportId[];

    let sportsCopy: SportId[];

    type SportMetadata = { sport: SportId; title: string; class: string[] };
    const metadata: SportMetadata[] = [
        {
            sport: "F1",
            title: "Formula 1",
            class: ["peer/f1", "peer-checked/f1:daisy-btn-primary"],
        },
        {
            sport: "FE",
            title: "Formula E",
            class: ["peer/fe", "peer-checked/fe:daisy-btn-primary"],
        },
        {
            sport: "XE",
            title: "Extreme E",
            class: ["peer/xe", "peer-checked/xe:daisy-btn-primary"],
        },
        {
            sport: "INDY",
            title: "Indycar",
            class: ["peer/indy", "peer-checked/indy:daisy-btn-primary"],
        },
        {
            sport: "W",
            title: "W Series",
            class: ["peer/w", "peer-checked/w:daisy-btn-primary"],
        },
        {
            sport: "WEC",
            title: "WEC",
            class: ["peer/wec", "peer-checked/wec:daisy-btn-primary"],
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
    <button
        class="daisy-btn daisy-btn-square daisy-btn-active daisy-btn-ghost"
        on:click={reset}
    >
        Toggle
    </button>
    <div class="daisy-divider daisy-divider-horizontal" />
    <div class="flex overflow-x-scroll overflow-y-hidden">
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
                class="daisy-btn daisy-btn-active daisy-btn-ghost {s.class[1]}"
            >
                {s.title}
            </label>
        {:else}
            <p>Nothing</p>
        {/each}
    </div>
</div>
