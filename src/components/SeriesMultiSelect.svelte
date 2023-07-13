<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import type { SeriesId } from "../../lib/types";
    import { seriesIds } from "../../lib/types";
    import {
        getSeriesHue,
        getSeriesIcon,
        getSeriesTitle,
    } from "../../lib/utils/series";

    export let series: SeriesId[];
    let seriesCopy: SeriesId[];

    const reset = (e: Event & { currentTarget: HTMLInputElement }) => {
        if (series.length === 0) e.currentTarget!.checked = true;
        series = seriesCopy.slice(0);
    };
    onMount(() => {
        seriesCopy = series.slice(0);
    });
</script>

<div class="multi-select">
    <fieldset aria-label="Filters for series">
        <label for="all" aria-label="Show all series">
            <Icon icon="ph:list-checks-bold" />
            <span>All</span>
            <input
                id="all"
                name="series"
                type="checkbox"
                checked={series.length === 0}
                on:input={reset}
            />
        </label>
        <div class="divider horizontal" aria-hidden />
        {#each seriesIds as s}
            <label for={s} style="--icon-hue: {getSeriesHue(s)}">
                <Icon icon="fluent-emoji-high-contrast:{getSeriesIcon(s)}" />
                <span>{getSeriesTitle(s)}</span>
                <input
                    id={s}
                    name="series"
                    type="checkbox"
                    bind:group={series}
                    value={s}
                />
            </label>
        {/each}
    </fieldset>
</div>

<style lang="scss">
    @import "../styles/oklch.scss";

    .multi-select {
        width: 100%;
        display: flex;
        position: sticky;
        top: 0;
        z-index: 10;

        fieldset {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            align-self: start;
            gap: var(--size-1);
            padding: var(--size-2) 0;

            border: none;
            border-radius: 0;
            background: var(--theme-surface-1);

            label {
                align-items: center;
                border-radius: var(--radius-round);
                display: inline-flex;
                font-size: var(--font-size-3);
                gap: var(--size-3);
                margin-inline-start: calc(var(--size-4) * -1);
                margin: 0;
                outline-offset: 0;
                padding: var(--size-2);
                padding-inline: var(--size-3);
                position: relative;
                transition: outline-offset 145ms var(--ease-2) 0.2s;

                --icon-chroma: 0.25;

                > :global(svg.iconify) {
                    color: #{get-surface(5, "neutral-chroma", "neutral-hue")};
                }
                > span {
                    flex: 2;
                }
                > input[type="checkbox"] {
                    height: 0;
                    opacity: 0;
                    overflow: hidden;
                    position: absolute;
                    width: 0;
                }

                &:is(:focus-visible, :has(:checked)) {
                    background: var(--theme-surface-2);
                    text-decoration: none;

                    > :global(svg.iconify) {
                        color: #{get-surface(5, "icon-chroma", "icon-hue")};
                    }
                }
                @media (--md-n-above) {
                    &:is(:hover, :target) {
                        background: var(--theme-surface-2);
                        text-decoration: none;

                        > :global(svg.iconify) {
                            color: #{get-surface(5, "icon-chroma", "icon-hue")};
                        }
                    }
                }
                &:focus-within {
                    outline: 1px solid var(--link);
                    outline-offset: 5px;
                }
            }
        }
    }
</style>
