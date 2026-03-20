let lastKnownItemName = "TSR Download";

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SET_TSR_NAME") {
        lastKnownItemName = message.name;
    }
});

chrome.downloads.onCreated.addListener((downloadItem) => {
    if (downloadItem.url.includes("thesimsresource.com")) {
        // Check if TSR interception is enabled
        chrome.storage.sync.get('tsrEnabled', (data) => {
            if (data.tsrEnabled === false) return; // Exit if disabled

            chrome.downloads.cancel(downloadItem.id);

            const encodedUrl = encodeURIComponent(downloadItem.url);
            const encodedName = encodeURIComponent(lastKnownItemName);
            const deeplink = `sims4modmanager://direct-download/?url=${encodedUrl}&name=${encodedName}`;

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: "TRIGGER_S4MM_DEEPLINK",
                        deeplink: deeplink,
                        fileName: lastKnownItemName
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            chrome.tabs.update(tabs[0].id, { url: deeplink });
                        }
                    });
                }
            });
        });
    }
});