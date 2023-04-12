<script lang="ts">
    import { Round, Session, Sport } from "@prisma/client";
    import SeriesMultiSelect from "./SeriesMultiSelect.svelte";

    type MappedRound = Pick<Round, "id" | "title" | "sport"> &
        Partial<Pick<Session, "startDate">> & { isFinished: string };

    export let rounds: MappedRound[];
    $: includedSports = [Sport.F1, Sport.INDY];

    const getDateString = (date: Date) => {
        return Intl.DateTimeFormat().format(date);
    };
</script>

<SeriesMultiSelect bind:sports={includedSports} />

<table class="daisy-table w-full">
    <thead>
        <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Finished</th>
            <th>Sport</th>
        </tr>
    </thead>
    <tbody>
        {#each rounds as round}
            <tr
                class:collapse={includedSports &&
                    !includedSports.includes(round.sport)}
            >
                <td>{round.title}</td>
                <td>
                    {getDateString(new Date(round.startDate ?? ""))}
                </td>
                <td>{round.isFinished}</td>
                <td>{round.sport}</td>
            </tr>
        {:else}
            <tr>
                <td style="column-span: all">Nothing here!</td>
            </tr>
        {/each}
    </tbody>
</table>
