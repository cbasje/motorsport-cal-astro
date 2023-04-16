<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import { SportId, sportIds } from "../../lib/types";
    import { getSeriesTitle } from "../../lib/utils";

    export let sports: SportId[];
    let sportsCopy: SportId[];

    const checkboxClass: Record<SportId, string> = {
        F1: "peer/f1",
        FE: "peer/fe",
        XE: "peer/xe",
        INDY: "peer/indy",
        W: "peer/w",
        WEC: "peer/wec",
    };
    const labelClass: Record<SportId, string> = {
        F1: "peer-checked/f1:daisy-btn-primary",
        FE: "peer-checked/fe:daisy-btn-primary",
        XE: "peer-checked/xe:daisy-btn-primary",
        INDY: "peer-checked/indy:daisy-btn-primary",
        W: "peer-checked/w:daisy-btn-primary",
        WEC: "peer-checked/wec:daisy-btn-primary",
    };

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
        aria-label="Reset filter"
    >
        <Icon icon="ph:arrow-counter-clockwise-bold" />
    </button>
    <div class="daisy-divider daisy-divider-horizontal" aria-hidden />
    <div class="flex overflow-x-scroll overflow-y-hidden" aria-label="Filters">
        {#each sportIds as s}
            <input
                type="checkbox"
                bind:group={sports}
                value={s}
                id="{s}-check"
                class="hidden {checkboxClass[s]}"
            />
            <label
                for="{s}-check"
                class="daisy-btn daisy-btn-active daisy-btn-ghost {labelClass[
                    s
                ]}"
            >
                {getSeriesTitle(s)}
            </label>
        {:else}
            <p>Nothing</p>
        {/each}
    </div>
</div>
