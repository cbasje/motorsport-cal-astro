<script lang="ts">
    import { cycleTimeFormat } from "$lib/stores/dateStore";
</script>

<button on:click={() => cycleTimeFormat()}>
    <slot/>
</button>
