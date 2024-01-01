<script lang="ts">
    import {
        QueryClient,
        QueryClientProvider,
    } from "@sveltestack/svelte-query";
    import NextSession from "./NextSession.svelte";

    const queryClient = new QueryClient();

    export let roundId: number;
</script>

<QueryClientProvider client={queryClient}>
    <NextSession {roundId}>
		<slot name="icon-future" slot="icon-future" />
		<slot name="icon-now" slot="icon-now" />
	</NextSession>
</QueryClientProvider>
