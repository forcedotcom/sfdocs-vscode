window.addEventListener('DOMContentLoaded', async () => {
    const sidebarUrl = getMeta('salesforcedocs:sidebar');

    if (sidebarUrl) {
        const sidebar = await getHtmlContent(sidebarUrl);
        document.querySelector('.navigation').innerHTML = sidebar;
    }
});

function getMeta(name) {
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) {
        return meta.getAttribute('content');
    }
    return;
}

async function getHtmlContent(url) {
    const response = await fetch(url);
    return await response.text();
}
