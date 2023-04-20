<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import type { SeriesId } from "../../lib/types";
    import { seriesIds } from "../../lib/types";
    import { getSeriesIcon, getSeriesTitle } from "../../lib/utils/series";

    export let series: SeriesId[];
    let seriesCopy: SeriesId[];

    const checkboxClass: Record<SeriesId, string> = {
        F1: "peer/f1",
        F2: "peer/f2",
        F3: "peer/f3",
        FE: "peer/fe",
        XE: "peer/xe",
        INDY: "peer/indy",
        W: "peer/w",
        WEC: "peer/wec",
        F1A: "peer/f1a",
    };
    const labelClass: Record<SeriesId, string> = {
        F1: "peer-checked/f1:daisy-btn-primary",
        F2: "peer-checked/f2:daisy-btn-primary",
        F3: "peer-checked/f3:daisy-btn-primary",
        FE: "peer-checked/fe:daisy-btn-primary",
        XE: "peer-checked/xe:daisy-btn-primary",
        INDY: "peer-checked/indy:daisy-btn-primary",
        W: "peer-checked/w:daisy-btn-primary",
        WEC: "peer-checked/wec:daisy-btn-primary",
        F1A: "peer-checked/f1a:daisy-btn-primary",
    };

    const reset = () => {
        series = seriesCopy.slice(0);
    };
    onMount(() => {
        seriesCopy = series.slice(0);
    });
</script>

<div class="flex w-full">
    {#if series.length > 0}
        <button
            class="daisy-btn daisy-btn-square daisy-btn-active daisy-btn-ghost"
            on:click={reset}
            aria-label="Reset filter"
        >
            <Icon icon="ph:arrow-counter-clockwise-bold" />
        </button>
        <div class="daisy-divider daisy-divider-horizontal" aria-hidden />
    {/if}
    <div class="flex overflow-x-scroll overflow-y-hidden" aria-label="Filters">
        {#each seriesIds as s}
            <input
                type="checkbox"
                bind:group={series}
                value={s}
                id="{s}-check"
                class="hidden {checkboxClass[s]}"
            />
            <label
                for="{s}-check"
                class="daisy-btn daisy-btn-active daisy-btn-ghost {labelClass[
                    s
                ]}"
                title={getSeriesTitle(s)}
            >
                <Icon icon="fluent-emoji-high-contrast:{getSeriesIcon(s)}" />
                {getSeriesTitle(s)}
            </label>
        {:else}
            <p>Nothing</p>
        {/each}
    </div>
</div>
