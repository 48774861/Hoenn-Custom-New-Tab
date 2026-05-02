
export function setupNotesBox() {
    const notes = document.getElementById("quick-notes");
    const btn = document.getElementById("notes-bg-btn");

    if (!notes || !btn) {
        console.error("Notes elements missing");
        return;
    }

    // TEXT PERSISTENCE (FIXED)
    const savedText = localStorage.getItem("quick_notes");

    if (savedText !== null) {
        notes.value = savedText;
    }

    notes.addEventListener("input", () => {
        localStorage.setItem("quick_notes", notes.value);
    });

}