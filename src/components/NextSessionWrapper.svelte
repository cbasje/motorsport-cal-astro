<script lang="ts">
    import {
        QueryClient,
        QueryClientProvider,
    } from "@sveltestack/svelte-query";
    import NextSession from "./NextSession.svelte";

    const queryClient = new QueryClient();

    export let roundId: string;
</script>

<QueryClientProvider client={queryClient}>
    <NextSession {roundId} />
</QueryClientProvider>
