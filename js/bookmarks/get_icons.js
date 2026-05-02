/*
    Responsible for setting up the icons for the bookmarks bar.
    Includes the bookmark icons, folder icons, and back button to get out of folders.
*/
export function createFolder(node) {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("icons/folder.png");
  img.title = node.title;
  return img;
}

export function createBackButton() {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("icons/backbutton.png");
  img.title = "Back";
  return img;
}

export function createBookmark(node) {
  const img = document.createElement("img");

  let domain = "";
  try {
    domain = new URL(node.url).hostname;
  } catch {}

  const clean = node.url.toLowerCase()
    .replace("https://", "")
    .replace("http://", "")
    .replace("www.", "");

  const firstWord = clean.substring(0, 10);

  const customIcon = chrome.runtime.getURL(`icons/${firstWord}.png`);
  const defaultIcon = chrome.runtime.getURL("icons/default.png");

  const duckIcon = domain
    ? `https://icons.duckduckgo.com/ip3/${domain}.ico`
    : null;

  const googleIcon = domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
    : null;

  const sources = [customIcon, duckIcon, googleIcon].filter(Boolean);

  loadValidIcon(img, sources, defaultIcon);

  img.title = node.title;

  img.addEventListener("click", () => {
    navigate(node.url);
  });

  return img;
}

/* ---------------- ICON LOADER ---------------- */

export function loadValidIcon(img, sources, defaultIcon) {
  let index = 0;

  function tryNext() {
    if (index >= sources.length) {
      img.src = defaultIcon;
      return;
    }

    const src = sources[index];
    const testImg = new Image();

    let done = false;

    const fail = () => {
      if (done) return;
      done = true;
      index++;
      tryNext();
    };

    const timeout = setTimeout(fail, 1200);

    testImg.onload = () => {
      if (done) return;
      done = true;

      clearTimeout(timeout);

      const w = testImg.naturalWidth;
      const h = testImg.naturalHeight;

      if (w < 32 || h < 32 || src.endsWith(".ico")) {
        index++;
        tryNext();
        return;
      }

      img.src = src;
    };

    testImg.onerror = fail;

    testImg.src = src;
  }

  tryNext();
}