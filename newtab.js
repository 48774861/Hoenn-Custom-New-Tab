document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("settings-btn");

  btn.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://settings/" });
  });

  const dock = document.getElementById("app-dock");

  chrome.bookmarks.getTree((tree) => {
    const root = tree?.[0]?.children || [];

    function walk(nodes) {
      nodes.forEach((node) => {
        if (node.url) {

          let clean = node.url.toLowerCase();

          // remove protocol
          clean = clean.replace("https://", "").replace("http://", "");

          // remove www
          clean = clean.replace("www.", "");

          // first 10 chars
          const firstWord = clean.substring(0, 10);

          const img = document.createElement("img");

          const customIcon = `icons/${firstWord}.png`;

          // DuckDuckGo favicon fallback (stable + no CORS issues)
          let domain = "";
          try {
            domain = new URL(node.url).hostname;
          } catch {
            domain = "";
          }

          const duckIcon = domain
            ? `https://icons.duckduckgo.com/ip3/${domain}.ico`
            : null;

          const defaultIcon = "icons/default.png";

          let stage = 0;

          img.src = customIcon;

          img.onerror = () => {
            if (stage === 0 && duckIcon) {
              stage = 1;
              img.src = duckIcon;
            } else if (stage === 1) {
              stage = 2;
              img.onerror = null;
              img.src = defaultIcon;
            } else {
              img.onerror = null;
            }
          };

          img.addEventListener("click", () => {
            window.open(node.url, "_blank");
          });

          dock.appendChild(img);
        }

        if (node.children) {
          walk(node.children);
        }
      });
    }

    walk(root);
  });
});