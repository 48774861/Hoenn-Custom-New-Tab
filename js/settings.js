
export function setupSettingsButton() {
    const settingsBtn = document.getElementById("settings-btn");

    settingsBtn?.addEventListener("click", () => {
        chrome.tabs.update({ url: "chrome://settings/" });
    });
}