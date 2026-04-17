document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("backBtn");

  btn.addEventListener("click", () => {
    const url = chrome.runtime.getURL("newtab.html");
    window.location.href = url;
  });
});