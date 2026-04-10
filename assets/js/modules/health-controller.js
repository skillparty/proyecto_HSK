class HealthController {
    constructor(app) {
        this.app = app;
    }

    isHealthCheckEnabled() {
        const params = new URLSearchParams(window.location.search);
        return params.get('health') === 'true';
    }

    async initHealthCheckPanelIfRequested() {
        if (!this.isHealthCheckEnabled()) {
            return;
        }

        const panelId = 'health-check-panel';
        if (document.getElementById(panelId)) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = panelId;
        panel.style.cssText = [
            'position:fixed',
            'bottom:16px',
            'right:16px',
            'z-index:10050',
            'width:320px',
            'max-width:calc(100vw - 24px)',
            'padding:12px',
            'border-radius:10px',
            'background:#0f172a',
            'border:1px solid rgba(148,163,184,0.35)',
            'color:#e2e8f0',
            'font:12px/1.4 Inter, system-ui, sans-serif',
            'box-shadow:0 8px 24px rgba(2,6,23,0.45)'
        ].join(';');

        panel.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
                '<strong style="font-size:12px;letter-spacing:.02em;">Health Check</strong>' +
                '<div style="display:flex;gap:6px;">' +
                    '<button id="health-check-download" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Download</button>' +
                    '<button id="health-check-copy" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Copy</button>' +
                    '<button id="health-check-clear" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Clear</button>' +
                    '<button id="health-check-refresh" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Refresh</button>' +
                '</div>' +
            '</div>' +
            '<div id="health-check-content">Loading...</div>';

        document.body.appendChild(panel);

        const render = async () => {
            const content = panel.querySelector('#health-check-content');
            if (!content) {
                return;
            }

            const authUser = window.firebaseClient ? window.firebaseClient.user : null;
            const swVersion = await this.getServiceWorkerVersion();
            const buildMeta = this.getBuildMetadata();
            const digest = this.getErrorDigest();
            const latestError = digest[0]
                ? (digest[0].source + ': ' + digest[0].message)
                : 'none';
            const checklist = this.getHealthChecklist({
                swVersion,
                digest,
                authUser,
                hasFirebaseConfig: !!window.firebaseConfig
            });

            const rows = [
                ['Online', navigator.onLine ? 'yes' : 'no'],
                ['Language', this.app.currentLanguage || 'unknown'],
                ['Auth user', (authUser && (authUser.email || authUser.id)) || 'guest'],
                ['Firebase config', window.firebaseConfig ? 'loaded' : 'missing'],
                ['SW control', navigator.serviceWorker && navigator.serviceWorker.controller ? 'active' : 'none'],
                ['SW version', swVersion || 'unknown'],
                ['App version', buildMeta.appVersion],
                ['Build hash', buildMeta.buildHash],
                ['Legacy API', window.HSK_ENABLE_LEGACY_BACKEND_API === true ? 'enabled' : 'disabled'],
                ['Errors (max 10)', String(digest.length)],
                ['Last error', latestError]
            ];

            const statusColor = {
                ok: '#22c55e',
                warn: '#f59e0b',
                error: '#ef4444'
            };

            const checklistHtml = checklist
                .map((item) => '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:4px 0;"><span style="color:#94a3b8;">' + item.label + '</span><span style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (statusColor[item.status] || '#64748b') + ';"></span><span>' + item.value + '</span></span></div>')
                .join('');

            content.innerHTML = rows
                .map(([label, value]) => '<div style="display:flex;justify-content:space-between;gap:8px;margin:2px 0;"><span style="color:#94a3b8;">' + label + '</span><span style="text-align:right;word-break:break-word;">' + value + '</span></div>')
                .join('') + '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(148,163,184,0.25);">' + checklistHtml + '</div>';
        };

        const refreshBtn = panel.querySelector('#health-check-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                render();
            });
        }

        const clearBtn = panel.querySelector('#health-check-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearErrorDigest();
                render();
            });
        }

        const copyBtn = panel.querySelector('#health-check-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                await this.copyHealthSummaryToClipboard();
            });
        }

        const downloadBtn = panel.querySelector('#health-check-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadHealthSummaryFile();
            });
        }

        await render();
    }

    async getServiceWorkerVersion() {
        if (!('serviceWorker' in navigator)) {
            return null;
        }

        const controller = navigator.serviceWorker.controller;
        if (!controller) {
            return null;
        }

        return new Promise((resolve) => {
            const channel = new MessageChannel();
            const timeoutId = setTimeout(() => resolve(null), 1200);

            channel.port1.onmessage = (event) => {
                clearTimeout(timeoutId);
                resolve(event.data && event.data.version ? event.data.version : null);
            };

            try {
                controller.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
            } catch (error) {
                clearTimeout(timeoutId);
                resolve(null);
            }
        });
    }

    getBuildMetadata() {
        const configured = window.HSK_BUILD_META || {};
        const versionLabel = document.querySelector('.version') ? document.querySelector('.version').textContent : '';
        const appVersion = configured.appVersion || (versionLabel.split('|')[0] || '').trim() || 'unknown';

        let buildHash = configured.buildHash || 'unknown';
        const appScript = document.querySelector('script[src*="assets/js/app.js"]');
        const appScriptSrc = appScript ? appScript.getAttribute('src') || '' : '';
        const match = appScriptSrc.match(/[?&]v=([^&]+)/);
        if (match && match[1]) {
            buildHash = 'v' + match[1];
        }

        return { appVersion, buildHash };
    }

    getHealthChecklist({ swVersion, digest, authUser, hasFirebaseConfig }) {
        const isOnline = navigator.onLine;
        const hasErrors = digest.length > 0;
        const hasAuthUser = !!authUser;

        return [
            {
                label: 'Connectivity',
                status: isOnline ? 'ok' : 'warn',
                value: isOnline ? 'OK' : 'Offline'
            },
            {
                label: 'Firebase Config',
                status: hasFirebaseConfig ? 'ok' : 'error',
                value: hasFirebaseConfig ? 'OK' : 'Missing'
            },
            {
                label: 'Service Worker',
                status: swVersion ? 'ok' : 'warn',
                value: swVersion ? 'Active' : 'Unknown'
            },
            {
                label: 'Auth Session',
                status: hasAuthUser ? 'ok' : 'warn',
                value: hasAuthUser ? 'Signed-in' : 'Guest'
            },
            {
                label: 'Runtime Errors',
                status: hasErrors ? 'warn' : 'ok',
                value: hasErrors ? (digest.length + ' detected') : 'None'
            }
        ];
    }

    setupErrorDigestMonitoring() {
        if (window.__hskErrorDigestMonitoringEnabled) {
            return;
        }

        window.__hskErrorDigestMonitoringEnabled = true;

        window.addEventListener('error', (event) => {
            const target = event.target;

            if (target && target !== window) {
                const resourceUrl = target.currentSrc || target.src || target.href || 'unknown resource';
                this.logRuntimeIssue('resource', 'Failed to load: ' + resourceUrl);
                return;
            }

            const message = event.message || (event.error && event.error.message) || 'Unknown runtime error';
            this.logRuntimeIssue('error', message);
        }, true);

        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            let message = 'Unhandled promise rejection';

            if (typeof reason === 'string') {
                message = reason;
            } else if (reason && reason.message) {
                message = reason.message;
            } else {
                try {
                    message = JSON.stringify(reason);
                } catch (error) {
                    message = String(reason);
                }
            }

            this.logRuntimeIssue('promise', message);
        });
    }

    getErrorDigest() {
        try {
            const raw = localStorage.getItem(this.app.errorDigestStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    saveErrorDigest(entries) {
        try {
            localStorage.setItem(this.app.errorDigestStorageKey, JSON.stringify(entries));
        } catch (error) {
            this.app.logWarn('Could not save error digest:', error);
        }
    }

    clearErrorDigest() {
        try {
            localStorage.removeItem(this.app.errorDigestStorageKey);
        } catch (error) {
            this.app.logWarn('Could not clear error digest:', error);
        }
    }

    async buildHealthSummary() {
        const digest = this.getErrorDigest();
        const authUser = window.firebaseClient ? window.firebaseClient.user : null;
        const swVersion = await this.getServiceWorkerVersion();
        const swControl = navigator.serviceWorker && navigator.serviceWorker.controller ? 'active' : 'none';
        const buildMeta = this.getBuildMetadata();

        const lines = [
            'time=' + new Date().toISOString(),
            'online=' + navigator.onLine,
            'language=' + (this.app.currentLanguage || 'unknown'),
            'authUser=' + ((authUser && (authUser.email || authUser.id)) || 'guest'),
            'firebaseConfig=' + (window.firebaseConfig ? 'loaded' : 'missing'),
            'swControl=' + swControl,
            'swVersion=' + (swVersion || 'unknown'),
            'appVersion=' + buildMeta.appVersion,
            'buildHash=' + buildMeta.buildHash,
            'legacyApi=' + (window.HSK_ENABLE_LEGACY_BACKEND_API === true ? 'enabled' : 'disabled'),
            'errors=' + digest.length
        ];

        digest.forEach((entry, index) => {
            lines.push('error[' + (index + 1) + ']=' + entry.timestamp + ' | ' + entry.source + ' | ' + entry.message);
        });

        return lines.join('\n');
    }

    async copyHealthSummaryToClipboard() {
        const text = await this.buildHealthSummary();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                this.app.showToast('Health summary copied', 'success', 1500);
                return;
            }
        } catch (error) {
            this.app.logWarn('Clipboard API unavailable:', error);
        }

        this.app.showToast('Could not copy summary automatically', 'error', 1800);
    }

    downloadHealthSummaryFile() {
        this.buildHealthSummary().then((text) => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = 'hsk-health-' + timestamp + '.txt';

            try {
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                URL.revokeObjectURL(url);
                this.app.showToast('Health summary downloaded', 'success', 1500);
            } catch (error) {
                this.app.logWarn('Could not download summary:', error);
                this.app.showToast('Could not download summary', 'error', 1800);
            }
        }).catch((error) => {
            this.app.logWarn('Could not build health summary:', error);
            this.app.showToast('Could not download summary', 'error', 1800);
        });
    }

    logRuntimeIssue(source, message) {
        const normalizedMessage = String(message || 'unknown error').slice(0, 220);
        const digest = this.getErrorDigest();
        const now = Date.now();
        const latest = digest[0];

        if (latest && latest.source === source && latest.message === normalizedMessage) {
            const latestTs = new Date(latest.timestamp || 0).getTime();
            if (now - latestTs < 2000) {
                return;
            }
        }

        const nextDigest = [{
            source,
            message: normalizedMessage,
            timestamp: new Date(now).toISOString()
        }, ...digest].slice(0, this.app.maxErrorDigestEntries);

        this.saveErrorDigest(nextDigest);
    }
}

window.HealthController = HealthController;
