const patreonCB = document.getElementById('patreonToggle');
const tsrCB = document.getElementById('tsrToggle');

// Load saved settings
chrome.storage.sync.get(['patreonEnabled', 'tsrEnabled'], (data) => {
    patreonCB.checked = data.patreonEnabled !== false; // Default to true
    tsrCB.checked = data.tsrEnabled !== false;
});

// Save settings on change
[patreonCB, tsrCB].forEach(cb => {
    cb.addEventListener('change', () => {
        chrome.storage.sync.set({
            patreonEnabled: patreonCB.checked,
            tsrEnabled: tsrCB.checked
        });
    });
});