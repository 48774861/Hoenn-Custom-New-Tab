export function setupClock() {

    // ---------------- CLOCK ----------------
    function updateClock() {
        const clock = document.getElementById("clock");
        if (!clock) return;

        const now = new Date();

        const date = now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        const time = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        clock.innerHTML = `${date}<br>${time}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
}