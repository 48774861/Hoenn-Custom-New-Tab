window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./gifs.json");
    const gifs = await res.json();

    const chosen = gifs[Math.floor(Math.random() * gifs.length)];

    document.getElementById("corner-gif").src = chosen;

    console.log("Loaded GIF:", chosen);
  } catch (e) {
    console.error(e);
  }
});