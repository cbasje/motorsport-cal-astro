<script lang="ts">
    export let dateString: string;

    let currentDate = new Date();

    let ms = 1000;
    const incr = () => (currentDate = new Date());

    let clear: NodeJS.Timeout;
    $: {
        clearInterval(clear);
        clear = setInterval(incr, ms);
    }

    let days = 0,
        hours = 0,
        mins = 0,
        secs = 0;
    $: {
        days =
            new Date(
                new Date(dateString).valueOf() - currentDate.valueOf()
            ).getDate() - 1;
        hours =
            new Date(
                new Date(dateString).valueOf() - currentDate.valueOf()
            ).getHours() - 1;
        mins = new Date(
            new Date(dateString).valueOf() - currentDate.valueOf()
        ).getMinutes();
        secs = new Date(
            new Date(dateString).valueOf() - currentDate.valueOf()
        ).getSeconds();
    }
</script>

<div class="grid grid-flow-col gap-5 text-center auto-cols-max">
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-5xl" data-date-component="days">
            <span style="--value: {days}" />
        </span>
        days
    </div>
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-5xl" data-date-component="hours">
            <span style="--value: {hours}" />
        </span>
        hours
    </div>
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-5xl" data-date-component="mins">
            <span style="--value: {mins}" />
        </span>
        mins
    </div>
    <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-5xl" data-date-component="secs">
            <span style="--value: {secs}" />
        </span>
        secs
    </div>
</div>
