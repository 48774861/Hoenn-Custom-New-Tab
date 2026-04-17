// document.addEventListener("DOMContentLoaded", () => {
//   const btn = document.getElementById("settings-btn");

//   btn.addEventListener("click", () => {
//     if (chrome.runtime && chrome.runtime.openOptionsPage) {
//       chrome.runtime.openOptionsPage();
//     } else {
//       console.error("Options page API not available");
//     }
//   });
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const btn = document.getElementById("settings-btn");

//   btn.addEventListener("click", () => {
//     const url = chrome.runtime.getURL("options.html");
//     window.location.href = url;
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("settings-btn");

  btn.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://settings/" });
  });
});