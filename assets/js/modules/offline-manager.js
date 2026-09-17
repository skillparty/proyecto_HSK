/**
 * OfflineManager Module - HSK Learning Platform
 * Manages downloading and offline caching of Chinese character stroke data (1,841 characters),
 * etymology datasets, calligraphy templates, and vocabulary for 100% offline study.
 * Includes storage persistence, live voice diagnostics, retry queues, and backup export/restore.
 */

class OfflineManager {
    constructor(app) {
        this.app = app;
        this.cacheName = "hsk-strokes-data";
        this.indexUrl = "assets/data/etymology/strokes-index.json";
        this.strokeBaseUrl = "assets/data/etymology/strokes/";
        this.isDownloading = false;
        this.shouldCancel = false;
        this.indexData = null;
        this.cachedSet = new Set();
        this.concurrency = 6;
        this.isInitialized = false;

        this.failedChars = [];
        this.storageEstimate = null;
        this.isPersisted = false;
        this.chineseVoiceInfo = null;

        this.essentialAssets = [
            "assets/data/etymology/seccion-a.json",
            "assets/data/etymology/seccion-b.json",
            "assets/data/etymology/seccion-c.json",
            "assets/data/etymology/strokes-index.json",
            "assets/vendor/hanzi-writer.min.js",
            "assets/js/modules/etymology-controller.js",
            "assets/css/etymology-styles.css",
            "assets/js/modules/writing-sheets-controller.js",
            "assets/css/app-writing-sheets.css",
            "assets/js/modules/flashcard-pdf-controller.js",
            "assets/css/flashcard-pdf-styles.css",
            "assets/data/vocab/hsk1_es.json",
            "assets/data/vocab/hsk2_es.json",
            "assets/data/vocab/hsk3_es.json"
        ];
    }

    get dialog() {
        return document.getElementById("offline-manager-dialog");
    }

    async initialize() {
        if (this.isInitialized) return;
        this.bindEvents();
        this.isInitialized = true;

        // Best-effort check on boot (after short delay to not block rendering)
        setTimeout(() => {
            this.checkCacheState().catch(() => {});
            this.updateStorageInfo().catch(() => {});
            this.checkVoiceSupport();
        }, 1500);

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                this.checkVoiceSupport();
            };
        }
    }

    bindEvents() {
        // Trigger from header settings menu
        const openBtn = document.getElementById("offline-manager-btn");
        if (openBtn) {
            openBtn.addEventListener("click", () => this.openModal());
        }

        // Trigger from dialog close buttons
        const closeBtn = document.getElementById("offline-modal-close");
        const gotItBtn = document.getElementById("offline-modal-got-it");
        if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
        if (gotItBtn) gotItBtn.addEventListener("click", () => this.closeModal());

        if (this.dialog) {
            this.dialog.addEventListener("click", (e) => {
                if (e.target === this.dialog) this.closeModal();
            });
        }

        // Action buttons inside modal
        const downloadBtn = document.getElementById("offline-start-download-btn");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                if (this.isDownloading) {
                    this.cancelDownload();
                } else {
                    const selectedOption = document.querySelector('input[name="offline-pack-choice"]:checked');
                    const packType = selectedOption ? selectedOption.value : "all";
                    this.startDownload(packType);
                }
            });
        }

        // Retry button for failed downloads
        const retryBtn = document.getElementById("offline-retry-download-btn");
        if (retryBtn) {
            retryBtn.addEventListener("click", () => {
                if (this.failedChars.length > 0) {
                    this.startDownload("retry", [...this.failedChars]);
                } else {
                    this.startDownload("all");
                }
            });
        }

        // Clear cache button
        const clearBtn = document.getElementById("offline-clear-cache-btn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => this.clearCache());
        }

        // Radio pack selection styling
        document.querySelectorAll(".offline-pack-option").forEach((label) => {
            label.addEventListener("click", () => {
                document.querySelectorAll(".offline-pack-option").forEach((l) => l.classList.remove("is-selected"));
                label.classList.add("is-selected");
            });
        });

        // External triggers (e.g. from Etymology tab)
        document.addEventListener("click", (e) => {
            const trigger = e.target.closest("#etym-offline-btn, .open-offline-manager-btn");
            if (trigger) {
                e.preventDefault();
                this.openModal();
            }
        });

        // Network status updates
        window.addEventListener("online", () => this.updateNetworkState(true));
        window.addEventListener("offline", () => this.updateNetworkState(false));

        // Persistence trigger button
        const persistBtn = document.getElementById("offline-request-persist-btn");
        if (persistBtn) {
            persistBtn.addEventListener("click", () => this.requestPersistence());
        }

        // Voice guide expand button
        const voiceHelpBtn = document.getElementById("offline-voice-help-btn");
        if (voiceHelpBtn) {
            voiceHelpBtn.addEventListener("click", () => {
                const audioGuide = document.getElementById("offline-guide-audio-details");
                if (audioGuide) {
                    audioGuide.open = true;
                    audioGuide.scrollIntoView({ behavior: "smooth" });
                }
            });
        }

        // Export and Import progress backup
        const exportBtn = document.getElementById("offline-export-backup-btn");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => this.exportProgress());
        }

        const importBtn = document.getElementById("offline-import-backup-btn");
        const restoreInput = document.getElementById("offline-restore-input");
        if (importBtn && restoreInput) {
            importBtn.addEventListener("click", () => restoreInput.click());
            restoreInput.addEventListener("change", (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.importProgress(e.target.files[0]);
                    restoreInput.value = "";
                }
            });
        }
    }

    async openModal() {
        const dialog = this.dialog;
        if (!dialog) return;

        if (typeof dialog.showModal === "function") {
            dialog.showModal();
        } else {
            dialog.style.display = "block";
        }

        await this.loadIndex();
        await this.checkCacheState();
        await this.updateStorageInfo();
        this.checkVoiceSupport();
    }

    closeModal() {
        const dialog = this.dialog;
        if (!dialog) return;

        if (typeof dialog.close === "function") {
            dialog.close();
        } else {
            dialog.style.display = "none";
        }
    }

    async loadIndex() {
        if (this.indexData) return this.indexData;
        try {
            const res = await fetch(this.indexUrl);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            this.indexData = await res.json();
            return this.indexData;
        } catch (err) {
            this.app?.logWarn?.("[offline-manager] Could not load index:", err);
            return null;
        }
    }

    async checkCacheState() {
        if (typeof window === "undefined" || !("caches" in window)) {
            return { total: 0, cached: 0, percent: 0 };
        }

        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            this.cachedSet.clear();

            keys.forEach((req) => {
                try {
                    const url = new URL(req.url);
                    const match = url.pathname.match(/\/strokes\/(.+)\.json$/);
                    if (match && match[1]) {
                        const char = decodeURIComponent(match[1]);
                        this.cachedSet.add(char);
                    }
                } catch { /* ignore parsing errors */ }
            });

            const total = (this.indexData && this.indexData.total) || 1841;
            const cached = this.cachedSet.size;
            const percent = Math.min(100, Math.round((cached / total) * 100));

            this.updateStatusUI(cached, total, percent);
            return { total, cached, percent };
        } catch (err) {
            this.app?.logWarn?.("[offline-manager] Check cache failed:", err);
            return { total: 1841, cached: 0, percent: 0 };
        }
    }

    updateStatusUI(cached, total, percent) {
        // Modal stats
        const strokeVal = document.getElementById("offline-stat-strokes-val");
        if (strokeVal) strokeVal.textContent = `${cached} / ${total}`;

        const strokePercent = document.getElementById("offline-stat-percent-val");
        if (strokePercent) strokePercent.textContent = `${percent}%`;

        // Progress bar (if not active downloading)
        if (!this.isDownloading) {
            const barFill = document.getElementById("offline-progress-bar-fill");
            const barPercent = document.getElementById("offline-progress-percent-text");
            const barStatus = document.getElementById("offline-progress-status-text");

            if (barFill) barFill.style.width = `${percent}%`;
            if (barPercent) barPercent.textContent = `${percent}%`;
            if (barStatus) {
                if (percent === 100) {
                    barStatus.textContent = this.t("offlineReadyFull") || "✅ Todos los caracteres listos offline";
                } else if (percent > 0) {
                    barStatus.textContent = `${cached} ${this.t("offlineCharsDownloaded") || "caracteres guardados"}`;
                } else {
                    barStatus.textContent = this.t("offlineNoneDownloaded") || "Sin datos descargados";
                }
            }
        }

        // Header and settings badges
        const headerBadge = document.getElementById("offline-btn-badge");
        if (headerBadge) {
            if (percent > 0) {
                headerBadge.textContent = percent === 100 ? "✓ 100%" : `${percent}%`;
                headerBadge.style.display = "inline-block";
                headerBadge.classList.toggle("badge-success", percent === 100);
            } else {
                headerBadge.style.display = "none";
            }
        }

        const etymBtnBadge = document.getElementById("etym-offline-status");
        if (etymBtnBadge) {
            etymBtnBadge.textContent = percent === 100 ? "✓ Offline" : `${percent}%`;
        }
    }

    /* ---------- Storage & Persistence Diagnostics ---------- */

    async requestPersistence() {
        if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.persist) {
            return false;
        }
        try {
            const persisted = await navigator.storage.persist();
            this.isPersisted = persisted;
            this.updateStorageUI();
            if (persisted) {
                this.toast(this.t("offlinePersistGranted") || "🛡️ Almacenamiento persistente activado. Los datos no se borrarán automáticamente.", "success");
            } else {
                this.toast(this.t("offlinePersistDenied") || "El navegador no concedió almacenamiento persistente.", "info");
            }
            return persisted;
        } catch (err) {
            this.app?.logWarn?.("[offline-manager] requestPersistence failed:", err);
            return false;
        }
    }

    async updateStorageInfo() {
        if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.estimate) {
            return null;
        }
        try {
            const estimate = await navigator.storage.estimate();
            let isPersisted = false;
            if (navigator.storage.persisted) {
                isPersisted = await navigator.storage.persisted();
            }
            this.isPersisted = isPersisted;
            this.storageEstimate = {
                usageBytes: estimate.usage || 0,
                quotaBytes: estimate.quota || 0,
                usageMB: ((estimate.usage || 0) / (1024 * 1024)).toFixed(1),
                quotaGB: ((estimate.quota || 0) / (1024 * 1024 * 1024)).toFixed(1),
                percentUsed: estimate.quota ? Math.min(100, (((estimate.usage || 0) / estimate.quota) * 100).toFixed(2)) : 0,
                isPersisted
            };
            this.updateStorageUI();
            return this.storageEstimate;
        } catch (err) {
            this.app?.logWarn?.("[offline-manager] updateStorageInfo failed:", err);
            return null;
        }
    }

    updateStorageUI() {
        const storageVal = document.getElementById("offline-stat-storage-val");
        const storageDetail = document.getElementById("offline-stat-storage-detail");
        const persistBadge = document.getElementById("offline-persist-badge");

        if (this.storageEstimate) {
            if (storageVal) {
                storageVal.textContent = `${this.storageEstimate.usageMB} MB`;
            }
            if (storageDetail) {
                storageDetail.textContent = `de ${this.storageEstimate.quotaGB} GB libres`;
            }
        }

        if (persistBadge) {
            if (this.isPersisted) {
                persistBadge.textContent = "🛡️ Persistente";
                persistBadge.className = "badge-success";
                persistBadge.title = this.t("offlinePersistActive") || "Almacenamiento protegido contra borrado automático";
            } else {
                persistBadge.textContent = "Estándar";
                persistBadge.className = "badge-warning";
            }
        }
    }

    /* ---------- Chinese Voice Diagnostics ---------- */

    checkVoiceSupport() {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            this.chineseVoiceInfo = { supported: false, hasChineseVoice: false };
            this.updateVoiceUI();
            return;
        }

        try {
            const voices = window.speechSynthesis.getVoices() || [];
            const chineseVoices = voices.filter((v) => {
                const lang = (v.lang || "").toLowerCase();
                const name = (v.name || "").toLowerCase();
                return (
                    lang.startsWith("zh") ||
                    lang.includes("cmn") ||
                    name.includes("chinese") ||
                    name.includes("mandarin")
                );
            });

            this.chineseVoiceInfo = {
                supported: true,
                hasChineseVoice: chineseVoices.length > 0,
                voiceName: chineseVoices.length > 0 ? chineseVoices[0].name : null,
                count: chineseVoices.length
            };
            this.updateVoiceUI();
        } catch (err) {
            this.app?.logWarn?.("[offline-manager] checkVoiceSupport failed:", err);
        }
    }

    updateVoiceUI() {
        const voiceBadge = document.getElementById("offline-voice-status-badge");
        const voiceDesc = document.getElementById("offline-voice-status-desc");
        if (!this.chineseVoiceInfo) return;

        if (voiceBadge) {
            if (this.chineseVoiceInfo.hasChineseVoice) {
                voiceBadge.textContent = `🟢 Voz China: ${this.chineseVoiceInfo.voiceName || "OK"}`;
                voiceBadge.className = "badge-success";
            } else {
                voiceBadge.textContent = "⚠️ Sin voz china instalada";
                voiceBadge.className = "badge-warning";
            }
        }

        if (voiceDesc) {
            if (this.chineseVoiceInfo.hasChineseVoice) {
                voiceDesc.textContent = this.t("offlineVoiceDetected") || "Pronunciación lista para usarse sin internet.";
            } else {
                voiceDesc.textContent = this.t("offlineVoiceMissingNotice") || "Instala la voz en chino en los ajustes de tu sistema para escuchar offline.";
            }
        }
    }

    /* ---------- Download & Retry Operations ---------- */

    async startDownload(packType = "all", customChars = null) {
        if (this.isDownloading) return;
        this.isDownloading = true;
        this.shouldCancel = false;
        this.failedChars = [];
        this.hideRetryButton();

        // Best effort: request persistent storage if not already granted
        if (!this.isPersisted && typeof navigator !== "undefined" && navigator.storage?.persist) {
            this.requestPersistence().catch(() => {});
        }

        const downloadBtn = document.getElementById("offline-start-download-btn");
        const downloadBtnText = document.getElementById("offline-download-btn-text");
        if (downloadBtn) downloadBtn.classList.add("btn-warning");
        if (downloadBtnText) downloadBtnText.textContent = this.t("offlineCancelBtn") || "Cancelar descarga";

        const progressSection = document.getElementById("offline-progress-section");
        if (progressSection) progressSection.style.display = "flex";

        try {
            await this.loadIndex();
            const cache = await caches.open(this.cacheName);

            // 1. Determine list of characters to download
            let targetChars = [];
            if (Array.isArray(customChars) && customChars.length > 0) {
                targetChars = customChars;
            } else if (this.indexData) {
                if (packType === "hsk1") {
                    targetChars = this.indexData.levels?.hsk1 || [];
                } else if (packType === "hsk13") {
                    const set = new Set([
                        ...(this.indexData.levels?.hsk1 || []),
                        ...(this.indexData.levels?.hsk2 || []),
                        ...(this.indexData.levels?.hsk3 || [])
                    ]);
                    targetChars = Array.from(set);
                } else {
                    targetChars = this.indexData.characters || [];
                }
            }

            if (targetChars.length === 0) {
                targetChars = this.indexData?.characters || [];
            }

            // 2. Cache essential app assets first
            const barStatus = document.getElementById("offline-progress-status-text");
            if (barStatus) barStatus.textContent = this.t("offlineCachingEssentials") || "Guardando módulos y vocabulario...";

            for (const assetUrl of this.essentialAssets) {
                if (this.shouldCancel) break;
                try {
                    const matched = await cache.match(assetUrl);
                    if (!matched) {
                        const res = await fetch(assetUrl);
                        if (res.ok) await cache.put(assetUrl, res);
                    }
                } catch { /* best effort */ }
            }

            // 3. Filter characters that are not yet cached
            const pendingChars = targetChars.filter((char) => !this.cachedSet.has(char));
            const totalToDownload = targetChars.length;
            let completedCount = totalToDownload - pendingChars.length;

            this.updateProgress(completedCount, totalToDownload);

            // 4. Download stroke files in parallel worker queue
            const queue = [...pendingChars];
            const workers = Array.from({ length: this.concurrency }, async () => {
                while (queue.length > 0 && !this.shouldCancel) {
                    const char = queue.shift();
                    const url = `${this.strokeBaseUrl}${encodeURIComponent(char)}.json`;

                    try {
                        const res = await fetch(url);
                        if (res.ok) {
                            await cache.put(url, res);
                            this.cachedSet.add(char);
                        } else {
                            this.failedChars.push(char);
                        }
                    } catch {
                        this.failedChars.push(char);
                    }

                    completedCount++;
                    this.updateProgress(completedCount, totalToDownload, char);
                }
            });

            await Promise.all(workers);

            if (this.shouldCancel) {
                this.toast(this.t("offlineDownloadCancelled") || "Descarga pausada.", "info");
            } else if (this.failedChars.length > 0) {
                const warnMsg = `${this.t("offlinePartialWarning") || "Descarga con pendientes:"} ${this.failedChars.length} caracteres no se descargaron por cortes de red.`;
                this.toast(warnMsg, "warning");
                this.updateRetryButton();
            } else {
                this.toast(this.t("offlineDownloadSuccess") || "🎉 ¡Caracteres descargados para uso 100% offline!", "success");
            }
        } catch (err) {
            this.app?.logError?.("[offline-manager] Download failed:", err);
            this.toast(this.t("offlineDownloadError") || "Error durante la descarga.", "error");
        } finally {
            this.isDownloading = false;
            this.shouldCancel = false;

            if (downloadBtn) downloadBtn.classList.remove("btn-warning");
            if (downloadBtnText) downloadBtnText.textContent = this.t("offlineDownloadBtn") || "Descargar Paquete Offline";

            await this.checkCacheState();
            await this.updateStorageInfo();
        }
    }

    updateRetryButton() {
        const retryBtn = document.getElementById("offline-retry-download-btn");
        const retryText = document.getElementById("offline-retry-btn-text");
        if (retryBtn) {
            if (this.failedChars.length > 0) {
                retryBtn.style.display = "inline-flex";
                if (retryText) {
                    retryText.textContent = `${this.t("offlineRetryBtn") || "Reintentar pendientes"} (${this.failedChars.length})`;
                }
            } else {
                retryBtn.style.display = "none";
            }
        }
    }

    hideRetryButton() {
        const retryBtn = document.getElementById("offline-retry-download-btn");
        if (retryBtn) retryBtn.style.display = "none";
    }

    cancelDownload() {
        if (!this.isDownloading) return;
        this.shouldCancel = true;
        const barStatus = document.getElementById("offline-progress-status-text");
        if (barStatus) barStatus.textContent = this.t("offlineCancelling") || "Cancelando...";
    }

    updateProgress(current, total, currentChar = "") {
        const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
        const barFill = document.getElementById("offline-progress-bar-fill");
        const barPercent = document.getElementById("offline-progress-percent-text");
        const barStatus = document.getElementById("offline-progress-status-text");
        const barSubtext = document.getElementById("offline-progress-subtext-counts");

        if (barFill) barFill.style.width = `${percent}%`;
        if (barPercent) barPercent.textContent = `${percent}%`;
        if (barStatus) {
            if (percent === 100) {
                barStatus.textContent = this.t("offlineDownloadComplete") || "✅ ¡Descarga completada!";
            } else {
                barStatus.textContent = `${this.t("offlineDownloading") || "Descargando:"} ${currentChar || ""}`;
            }
        }
        if (barSubtext) {
            barSubtext.textContent = `${current} / ${total}`;
        }
    }

    async clearCache() {
        if (this.isDownloading) {
            this.cancelDownload();
        }

        const confirmMsg = this.t("offlineConfirmClear") || "¿Deseas borrar los trazos descargados para liberar espacio?";
        if (typeof window !== "undefined" && window.confirm && !window.confirm(confirmMsg)) {
            return;
        }

        try {
            if ("caches" in window) {
                await caches.delete(this.cacheName);
            }
            this.cachedSet.clear();
            this.failedChars = [];
            this.hideRetryButton();
            await this.checkCacheState();
            await this.updateStorageInfo();
            this.toast(this.t("offlineClearedSuccess") || "🗑️ Caché de trazos liberado correctamente.", "info");
        } catch (err) {
            this.app?.logError?.("[offline-manager] Clear cache failed:", err);
        }
    }

    /* ---------- Progress Backup & Restore ---------- */

    async exportProgress() {
        try {
            const data = {
                app: "Confuc10++ HSK",
                version: "3.2.0",
                exportedAt: new Date().toISOString(),
                localStorage: {},
                indexedDB: {}
            };

            // 1. Gather all HSK localStorage keys
            if (typeof localStorage !== "undefined") {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith("hsk") || key.startsWith("confuc10"))) {
                        data.localStorage[key] = localStorage.getItem(key);
                    }
                }
            }

            // 2. Gather IndexedDB entries
            if (window.idbStorage && typeof window.idbStorage.getAllEntries === "function") {
                data.indexedDB = await window.idbStorage.getAllEntries();
            }

            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const dateStr = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `hsk-progreso-backup-${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.toast(this.t("offlineExportSuccess") || "💾 Copia de seguridad exportada correctamente.", "success");
        } catch (err) {
            this.app?.logError?.("[offline-manager] Export progress failed:", err);
            this.toast(this.t("offlineExportError") || "Error al exportar la copia de seguridad.", "error");
        }
    }

    async importProgress(file) {
        if (!file) return;

        const confirmMsg = this.t("offlineConfirmImport") || "¿Deseas restaurar esta copia de seguridad? Se actualizará tu progreso local de estudio.";
        if (typeof window !== "undefined" && window.confirm && !window.confirm(confirmMsg)) {
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data || (!data.localStorage && !data.indexedDB)) {
                throw new Error("Invalid backup format");
            }

            // 1. Restore localStorage
            if (data.localStorage && typeof localStorage !== "undefined") {
                Object.entries(data.localStorage).forEach(([key, val]) => {
                    try {
                        localStorage.setItem(key, val);
                    } catch { /* quota */ }
                });
            }

            // 2. Restore IndexedDB
            if (data.indexedDB && window.idbStorage && typeof window.idbStorage.set === "function") {
                for (const [key, val] of Object.entries(data.indexedDB)) {
                    await window.idbStorage.set(key, val);
                }
            }

            this.toast(this.t("offlineImportSuccess") || "🎉 ¡Progreso restaurado correctamente! Actualizando datos...", "success");

            setTimeout(() => {
                if (typeof window !== "undefined" && window.location) {
                    window.location.reload();
                }
            }, 1200);
        } catch (err) {
            this.app?.logError?.("[offline-manager] Import progress failed:", err);
            this.toast(this.t("offlineImportError") || "Error al importar el archivo de copia de seguridad.", "error");
        }
    }

    updateNetworkState(isOnline) {
        const networkBadge = document.getElementById("offline-modal-network-status");
        if (networkBadge) {
            networkBadge.textContent = isOnline
                ? (this.t("onlineStatus") || "🟢 En línea")
                : (this.t("offlineStatus") || "📡 Sin conexión (Offline)");
            networkBadge.className = isOnline ? "badge-success" : "badge-warning";
        }
    }

    t(key) {
        return this.app?.getTranslation?.(key) || "";
    }

    toast(msg, type = "info") {
        if (this.app?.uiController?.showToast) {
            this.app.uiController.showToast(msg, type, 3500);
        }
    }
}

window.OfflineManager = OfflineManager;
