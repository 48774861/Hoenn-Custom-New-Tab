export function initWiggle() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;

    let lastTime = 0;

    function getIntensity() {
    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;

    if (delta < 80) return "fast";
    if (delta < 180) return "medium";
    return "slow";
    }

    function wiggle(intensity) {
        searchInput.style.animation = "none";
        void searchInput.offsetHeight;

        if (intensity === "fast") {
            searchInput.style.animation = "wiggleFast 0.12s ease";
        } else if (intensity === "medium") {
            searchInput.style.animation = "wiggle 0.15s ease";
        } else {
            searchInput.style.animation = "wiggleSoft 0.2s ease";
        }
    }

    searchInput.addEventListener("keydown", () => wiggle(getIntensity()));
    searchInput.addEventListener("click", () => wiggle("medium"));
    searchInput.addEventListener("focus", () => wiggle("medium"));
}