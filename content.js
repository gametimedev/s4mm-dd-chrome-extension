// content.js

// --- UI HELPERS ---
function showToast(message) {
    const existing = document.querySelector('.ext-success-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ext-success-toast';
    toast.innerText = message;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#052d49',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        zIndex: '10000',
        fontFamily: 'inherit',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: 'translateY(20px)',
        opacity: '0'
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- PATREON LOGIC ---
function injectPatreonButtons() {
    // Only run if we are actually on Patreon
    if (!window.location.hostname.includes("patreon.com")) return;

    const containers = document.querySelectorAll('[data-tag="post-attachments"]');
    containers.forEach(container => {
        const originalLinks = container.querySelectorAll('a[data-tag="post-attachment-link"]');
        originalLinks.forEach(original => {
            if (original.dataset.extProcessed) return;

            const filename = original.innerText.trim();
            const extension = filename.toLowerCase().split('.').pop();
            const targetExtensions = ['zip', 'rar', 'package'];

            if (targetExtensions.includes(extension)) {
                const newBtn = original.cloneNode(true);
                newBtn.dataset.extProcessed = "true";

                const deeplink = `sims4modmanager://direct-download/?url=${encodeURIComponent(original.href)}&name=${encodeURIComponent(filename)}`;
                newBtn.href = deeplink;

                const color = "#24a333";
                const textElement = newBtn.querySelector('p');
                if (textElement) {
                    textElement.innerHTML = `<span style='font-weight:bold; color:${color};'>[Download with S4MM]</span> ` + textElement.innerText;
                }

                newBtn.onclick = () => showToast(`Sent ${filename} to S4MM!`);
                original.after(newBtn);
            }
            original.dataset.extProcessed = "true";
        });
    });
}

// --- TSR LOGIC ---
function handleTSR() {
    if (!window.location.hostname.includes("thesimsresource.com")) return;

    // Target the specific <h4> structure you provided
    const titleEl = document.querySelector('h4[style*="font-weight: bold"]');
    if (titleEl) {
        chrome.runtime.sendMessage({
            type: "SET_TSR_NAME",
            name: titleEl.innerText.trim()
        });
    }
}

// Catch the message from background.js to trigger the deeplink
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "TRIGGER_S4MM_DEEPLINK") {
        // Triggering the link from here counts as a 'user gesture' 
        // which allows the "Always allow" checkbox to appear.
        const link = document.createElement('a');
        link.href = request.deeplink;
        document.body.appendChild(link);
        link.click();
        link.remove();

        showToast(`Sent ${request.fileName} to S4MM!`);
    }
});

// --- INITIALIZATION ---
function init() {
    injectPatreonButtons();
    handleTSR();
}

init();
const observer = new MutationObserver(() => init());
observer.observe(document.body, { childList: true, subtree: true });