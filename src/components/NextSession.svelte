<script lang="ts">
    import Icon from "@iconify/svelte";
    import { useQuery } from "@sveltestack/svelte-query";
    import { trpc } from "lib/trpc/client";
    import { getSessionTitle } from "../../lib/utils/sessions";
    import Time from "./Time.svelte";

    export let roundId: string;

    const queryResult = useQuery(
        "nextSession",
        () =>
            trpc.sessions.getNextSessionByRoundId.query({
                roundId,
                now: new Date(),
            }),
        { refetchInterval: 5 * 60 * 1000, refetchIntervalInBackground: false }
    );
    // const nextSession = round.sessions.find((s) => s.endDate.valueOf() > now);
</script>

<div class="next-session">
    <Icon icon="ph:arrow-line-right-bold" />

    {#if $queryResult.isLoading}
        <span>Loading...</span>
        <!-- {:else if $queryResult.error}
    <span>An error has occurred: {$queryResult.error.message}</span> -->
    {:else if $queryResult.data}
        <span>
            {getSessionTitle($queryResult.data.type, $queryResult.data.number)}
        </span>
        <Time startDate={$queryResult.data.startDate} />
    {/if}
</div>

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
