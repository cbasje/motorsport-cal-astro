<script lang="ts">
    import Icon from "@iconify/svelte";
    import { useQuery } from "@sveltestack/svelte-query";
    import { trpc } from "lib/trpc/client";
    import { getSessionTitle } from "lib/utils/sessions";
    import { onMount } from "svelte";
    import Time from "./Time.svelte";

    let now = new Date();
    export let roundId: string;

    const queryResult = useQuery(
        "nextSession",
        () =>
            trpc.sessions.getNextSession.query({
                roundId,
                now,
            }),
        { refetchOnWindowFocus: false }
    );

    onMount(() => {
        const nowInterval = setInterval(() => {
            now = new Date();
        }, 5 * 60 * 1000);

        return nowInterval;
    });
</script>

{#if $queryResult.isLoading}
    <div class="next-session">
        <span>Loading...</span>
        <!-- {:else if $queryResult.error}
        <span>An error has occurred: {$queryResult.error.message}</span> -->
    </div>
{:else if $queryResult.data}
    <div class="next-session">
        {#if $queryResult.data.startDate.valueOf() >= now.valueOf()}
            <Icon icon="ph:arrow-line-right-bold" />
        {:else}
            <Icon icon="ph:car-bold" />
            <span>...</span>
        {/if}
        <span>
            {getSessionTitle(
                $queryResult.data.round.series,
                $queryResult.data.type,
                $queryResult.data.number
            )}
        </span>
        <Time
            startDate={$queryResult.data.startDate}
            timeZone={$queryResult.data.round.circuit.timezone ?? undefined}
        />
    </div>
{/if}

<style lang="scss">
    .next-session {
        background: var(--gray-0);
        color: var(--color-7);
        border-radius: var(--radius-3);

        display: flex;
        flex-direction: row;
        gap: var(--size-2);
        padding: var(--size-1) var(--size-3);
    }
</style>
