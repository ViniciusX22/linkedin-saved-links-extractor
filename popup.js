document.getElementById("extractBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    chrome.tabs.sendMessage(tabs[0].id, { action: "extractLinks" });
  });
});
