/* src/mountHooks.js */
import { onMount } from "svelte";
import { spring } from "svelte/motion";
import { writable, type Writable } from "svelte/store";

export function onRefresh(
    callback: () => Promise<void>,
    pullToRefreshId = "#pull-to-refresh",
    direction = 1
) {
    const thresholdDistance = 100 * direction;

    // this represents refreshing state if we are currently refreshing or not, this will be return to the caller of this function
    const refreshing = writable(false);

    // is true if threshold distance swiped else false used to figure out if a refresh is needed on touchend
    let shouldRefresh = false;

    // will be set to element references later on
    let scrollArea: HTMLElement | null;
    let pullToRefresh: HTMLDivElement | null;

    // start Y coordinate of swipe
    let startY = 0;
    let border = 0;
    // touch ID used to start pullToRefresh, -1 is used to represent no pullToRefresh started yet
    let touchId = -1;

    // will be linked to css properties later on
    const offset = spring(0);

    function onTouchStart(e: TouchEvent) {
        // return if another touch is already registered for pull to refresh
        if (touchId > -1) return;
        const touch = e.touches[0];
        startY = touch.screenY + scrollArea!.scrollTop;
        touchId = touch.identifier;
    }

    function onTouchMove(e: TouchEvent) {
        // pull to refresh should only trigger if user is at top of the scroll area
        if (direction === -1) {
            if (
                scrollArea!.scrollTop + document.documentElement.clientHeight <
                border - 10
            )
                return;
        } else {
            if (scrollArea!.scrollTop > border + 5) return;
        }
        const touch = Array.from(e.changedTouches).find(
            (t) => t.identifier === touchId
        );
        if (!touch) return;

        let distance;
        if (direction === -1) {
            distance = touch.screenY + scrollArea!.scrollTop - startY;
            shouldRefresh = distance <= thresholdDistance;
            // if (distance != 0) scrollArea!.style.overflowY = "hidden";

            offset.set(Math.abs(Math.max(distance, thresholdDistance)));
        } else {
            distance = touch.screenY - startY;
            shouldRefresh = distance >= thresholdDistance;
            // if (distance != 0) scrollArea!.style.overflowY = "hidden";

            offset.set(Math.min(distance, thresholdDistance));
        }
    }

    function onTouchEnd(e: TouchEvent) {
        // needed so this doesn't trigger if some other touch ended
        const touch = Array.from(e.changedTouches).find(
            (t) => t.identifier === touchId
        );
        if (!touch) return;

        scrollArea!.style.overflowY = "auto";

        // reset touchId
        touchId = -1;

        // run callback if refresh needed
        if (shouldRefresh) {
            shouldRefresh = false;
            refreshing.set(true);

            callback().then(() => {
                refreshing.set(false);
                pullToRefresh?.scrollIntoView();
            });
        }

        // create a proxy value for the store to avoid using get(refreshing) in the spin loop
        let isRefreshing: boolean = true;
        const unsubscribe = refreshing.subscribe(
            (state) => (isRefreshing = state)
        );

        // spin the loader while refreshing
        function spin() {
            if (isRefreshing) {
                requestAnimationFrame(spin);
            } else {
                offset.set(0);
                unsubscribe();
            }
        }
        requestAnimationFrame(spin);
    }

    // set element references, link css properties to stores & register touch handlers
    onMount(() => {
        scrollArea = document.documentElement;
        pullToRefresh = document.querySelector<HTMLDivElement>(
            pullToRefreshId.replace(/^#?/g, "#")
        );

        if (!pullToRefresh)
            throw new Error(`no element with id ${pullToRefreshId} found`);

        // link offset to css properties
        const offsetUnsub = offset.subscribe((val) => {
            requestAnimationFrame(() => {
                pullToRefresh?.style.setProperty(
                    "--percentage",
                    `${val < 0 ? 0 : val}`
                );
            });
        });

        border = direction === -1 ? scrollArea!.scrollHeight : 0;

        scrollArea?.addEventListener("touchstart", onTouchStart);
        scrollArea?.addEventListener("touchmove", onTouchMove);
        scrollArea?.addEventListener("touchend", onTouchEnd);
        scrollArea?.addEventListener("touchcancel", onTouchEnd);

        return () => {
            offsetUnsub();
            scrollArea?.removeEventListener("touchstart", onTouchStart);
            scrollArea?.removeEventListener("touchmove", onTouchMove);
            scrollArea?.removeEventListener("touchend", onTouchEnd);
            scrollArea?.removeEventListener("touchcancel", onTouchEnd);
        };
    });

    // return refreshing state store
    return refreshing;
}
