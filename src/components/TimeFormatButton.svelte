<script lang="ts">
    import Icon from "@iconify/svelte";
    import { cycleTimeFormat } from "lib/stores/dateStore";
</script>

<button on:click={() => cycleTimeFormat()}>
    <Icon icon="lucide:clock" />
</button>
