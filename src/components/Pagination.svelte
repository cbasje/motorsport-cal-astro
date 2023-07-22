<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onRefresh } from "lib/scroll-pagination";

    const refreshing1 = onRefresh(
        () =>
            new Promise<void>((resolve, reject) => {
                console.log("ref1 ⬆️");
                setTimeout(() => {
                    resolve();
                }, 3000);
            }),
        "ptf-1",
        1
    );
    const refreshing2 = onRefresh(
        () =>
            new Promise<void>((resolve, reject) => {
                console.log("ref2 ⬇️");
                setTimeout(() => {
                    resolve();
                }, 1000);
            }),
        "ptf-2",
        -1
    );
</script>

<!-- this is the pull to refresh spinner -->
<div class="main" id="scroll-area">
    <div id="ptf-1" class="pull-to-refresh">
        <div class="ptr-icon" />
    </div>
    <div class="text">
        {#if !$refreshing1}
            <slot name="1" />
        {/if}
        {#if !$refreshing2}
            <slot name="2" />
        {/if}
    </div>
    <div id="ptf-2" class="pull-to-refresh">
        <div class="ptr-icon" />
    </div>
</div>
