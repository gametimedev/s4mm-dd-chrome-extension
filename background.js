// background.js

let lastKnownItemName = "TSR Download";

// Listen for the name from the content script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SET_TSR_NAME") {
        lastKnownItemName = message.name;
    }
});

chrome.downloads.onCreated.addListener((downloadItem) => {
    if (downloadItem.url.includes("thesimsresource.com")) {
        // 1. Cancel the browser's default download
        chrome.downloads.cancel(downloadItem.id);

        const encodedUrl = encodeURIComponent(downloadItem.url);
        const encodedName = encodeURIComponent(lastKnownItemName);
        const deeplink = `sims4modmanager://direct-download/?url=${encodedUrl}&name=${encodedName}`;

        // 2. Send it back to the tab to trigger a "User Gesture" click
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "TRIGGER_S4MM_DEEPLINK",
                    deeplink: deeplink,
                    fileName: lastKnownItemName
                });
            }
        });
    }
});