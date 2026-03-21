let lastKnownItemName = "TSR Download";

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SET_TSR_NAME") {
        lastKnownItemName = message.name;
    }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    // 1. Only intercept if it's from TSR
    if (downloadItem.url.includes("thesimsresource.com")) {

        chrome.storage.sync.get('tsrEnabled', (data) => {
            if (data.tsrEnabled === false) {
                suggest(); // Let the download continue normally
                return;
            }

            // 2. Cancel the browser download
            chrome.downloads.cancel(downloadItem.id);

            // 3. Now downloadItem.url is much more likely to be the FINAL redirect URL
            const finalUrl = downloadItem.url;
            const encodedUrl = encodeURIComponent(finalUrl);
            const encodedName = encodeURIComponent(lastKnownItemName);
            const deeplink = `sims4modmanager://direct-download/?url=${encodedUrl}&name=${encodedName}`;

            // 4. Send to Content Script to trigger the 'User Gesture'
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

        // Return true to indicate we will call suggest() asynchronously 
        // (though we are canceling, this prevents the browser from hanging)
        return true;
    }
});