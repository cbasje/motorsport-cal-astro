<script lang="ts">
    import { onRefresh } from "$lib/scroll-pagination";

    const refreshingU = onRefresh(
        () =>
            new Promise<void>((resolve, reject) => {
                console.log("refU ⬆️");
                setTimeout(() => {
                    resolve();
                }, 3000);
            }),
        "ptf-u",
        1
    );
    const refreshingD = onRefresh(
        () =>
            new Promise<void>((resolve, reject) => {
                console.log("refD ⬇️");
                setTimeout(() => {
                    resolve();
                }, 1000);
            }),
        "ptf-d",
        -1
    );
</script>

<!-- this is the pull to refresh spinner -->
<div class="main" id="scroll-area">
    <div id="ptf-u" class="pull-to-refresh">
        <div class="ptr-icon" />
    </div>
    <div class="text">
        {#if !$refreshingU}
            <slot name="U" />
        {/if}
        {#if !$refreshingD}
            <slot name="D" />
        {/if}
    </div>
    <div id="ptf-d" class="pull-to-refresh">
        <div class="ptr-icon" />
    </div>
</div>
