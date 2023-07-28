<script lang="ts">
    import { SessionZ } from "../../lib/types/prisma";
    import Icon from "@iconify/svelte";
    import { getSessionTitle } from "../../lib/utils/sessions";
    import Time from "./Time.svelte";
    import type { z } from "zod";

    const NextSessionZ = SessionZ.pick({
        type: true,
        startDate: true,
        endDate: true,
        number: true,
    });
    type NextSession = z.infer<typeof NextSessionZ>;

    export let nextSession: NextSession;
</script>

<div class="next-session">
    <Icon icon="ph:arrow-line-right-bold" />
    <span>
        {getSessionTitle(nextSession.type, nextSession.number)}
    </span>
    <Time startDate={nextSession.startDate} />
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
