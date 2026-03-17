function showToast(message) {
    // Remove existing toast if user clicks rapidly
    const existing = document.querySelector('.ext-success-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ext-success-toast';
    toast.innerText = message;

    // Styling to match Patreon's clean UI
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#052d49', // Dark Patreon-style blue
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

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function injectStyledButtons() {
    const containers = document.querySelectorAll('[data-tag="post-attachments"]');

    containers.forEach(container => {
        const originalLinks = container.querySelectorAll('a[data-tag="post-attachment-link"]');
        originalLinks.forEach(original => {
            if (original.dataset.extProcessed) return;
            const rawUrl = original.href;
            const filename = original.innerText.trim();
            const extension = filename.toLowerCase().split('.').pop();
            const targetExtensions = ['zip', 'rar', 'package'];
            if (targetExtensions.includes(extension)) {
                const newBtn = original.cloneNode(true);
                newBtn.dataset.extProcessed = "true";
                const encodedUrl = encodeURIComponent(rawUrl);
                const encodedName = encodeURIComponent(filename);
                const deeplink = `sims4modmanager://direct-download/?url=${encodedUrl}&name=${encodedName}`;
                newBtn.href = deeplink;
                const color = "#24a333";
                const textElement = newBtn.querySelector('p');
                if (textElement) {
                    textElement.innerHTML = `<span style='font-weight:bold; color:${color};'>[Download with S4MM]</span>  ` + textElement.innerText;
                }
                const icon = newBtn.querySelector('span');
                if (icon) icon.style.color = color;

                newBtn.onclick = (e) => {
                    showToast(`Sent ${filename} to Sims 4 Mod Manager!`);
                };

                original.after(newBtn);
            }

            original.dataset.extProcessed = "true";
        });
    });
}

// Re-run logic
injectStyledButtons();
const observer = new MutationObserver(() => injectStyledButtons());
observer.observe(document.body, { childList: true, subtree: true });