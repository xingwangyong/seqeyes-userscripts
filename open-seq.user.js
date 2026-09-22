// ==UserScript==
// @name         Open in SeqEyes for GitHub
// @namespace    https://github.com/
// @version      1.0.0
// @description  Adds a button on GitHub to open .seq pulse sequence files directly in SeqEyes Web Viewer.
// @author       SeqEyes Team
// @match        https://github.com/*
// @icon         https://github.githubassets.com/favicons/favicon.svg
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const APP_BASE_URL = 'https://bughht.github.io/seqeyes_plugin/?url=';

    function injectAll() {
        const path = window.location.pathname;

        // Blob page: single .seq file view
        if (path.endsWith('.seq') && path.includes('/blob/')) {
            if (!document.getElementById('seqeyes-open-btn')) {
                const rawBtn = document.querySelector('a[data-testid="raw-button"]')
                    || document.getElementById('raw-url');
                if (rawBtn) {
                    const btn = document.createElement('a');
                    btn.id = 'seqeyes-open-btn';
                    btn.href = `${APP_BASE_URL}${encodeURIComponent(rawBtn.href)}`;
                    btn.target = '_blank';
                    btn.rel = 'noopener noreferrer';
                    btn.textContent = 'Open in SeqEyes';
                    btn.style.cssText = [
                        'display:inline-flex',
                        'align-items:center',
                        'margin-left:6px',
                        'padding:3px 10px',
                        'border-radius:6px',
                        'background:#0969da',
                        'color:#fff',
                        'font-size:12px',
                        'font-weight:500',
                        'text-decoration:none',
                        'white-space:nowrap',
                        'cursor:pointer',
                    ].join(';');
                    rawBtn.insertAdjacentElement('afterend', btn);
                }
            }
        }

        // Directory listing: add button next to each .seq file
        document.querySelectorAll('a[aria-label$=", (File)"]').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (!href.endsWith('.seq')) return;

            // Already processed
            if (link.nextSibling && link.nextSibling.classList &&
                link.nextSibling.classList.contains('seqeyes-btn')) return;
            if (link.parentElement && link.parentElement.querySelector('.seqeyes-btn')) return;

            const rawUrl = `https://raw.githubusercontent.com${href.replace('/blob/', '/')}`;
            const btn = document.createElement('a');
            btn.className = 'seqeyes-btn';
            btn.href = `${APP_BASE_URL}${encodeURIComponent(rawUrl)}`;
            btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
            btn.textContent = 'SeqEyes↗';
            btn.style.cssText = [
                'display:inline-block',
                'margin-left:8px',
                'padding:1px 7px',
                'border-radius:4px',
                'background:#0969da',
                'color:#fff',
                'font-size:11px',
                'font-weight:500',
                'text-decoration:none',
                'white-space:nowrap',
                'vertical-align:middle',
            ].join(';');
            link.insertAdjacentElement('afterend', btn);
        });
    }

    // Poll every 500ms for up to 15 seconds after each page load
    function startPolling() {
        let count = 0;
        const id = setInterval(() => {
            injectAll();
            if (++count >= 30) clearInterval(id);
        }, 500);
    }

    startPolling();

    // Re-run on GitHub SPA navigation
    window.addEventListener('turbo:load', startPolling);
    window.addEventListener('turbo:render', startPolling);
    window.addEventListener('pjax:end', startPolling);
    window.addEventListener('popstate', startPolling);
})();
