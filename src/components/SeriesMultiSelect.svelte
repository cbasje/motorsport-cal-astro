<script lang="ts">
    import { Sport } from "@prisma/client";

    export let sports: Sport[];

    const series = [
        {
            sport: Sport.F1,
            title: "F1",
            class: ["peer/f1", "peer-checked/f1:btn-primary"],
        },
        {
            sport: Sport.INDY,
            title: "Indycar",
            class: ["peer/indy", "peer-checked/indy:btn-primary"],
        },
    ];

    const reset = () => {
        sports = [Sport.F1, Sport.INDY];
    };
</script>

<div class="flex w-full">
    <button class="btn btn-square btn-active btn-ghost" on:click={reset}
        >Toggle</button
    >
    <div class="divider divider-horizontal" />
    {#each series as s}
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
    <!-- {sports} -->
</div>
