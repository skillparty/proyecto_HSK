class ModalController {
    constructor(app) {
        this.app = app;
    }

    showSpanishLevelMessage() {
        this.app.logInfo('[modal] Spanish level limitation message');

        const notification = document.createElement('div');
        notification.style.cssText = [
            'position: fixed',
            'top: 50%',
            'left: 50%',
            'transform: translate(-50%, -50%)',
            'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'color: white',
            'padding: 24px 32px',
            'border-radius: 16px',
            'font-size: 0.95rem',
            'z-index: 10000',
            'box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3)',
            'animation: modalSlideIn 0.4s ease-out',
            'max-width: 90%',
            'text-align: center',
            'border: 2px solid rgba(255, 255, 255, 0.2)'
        ].join(';') + ';';

        const soonTitle = this.app.getTranslation('spanishLevelSoonTitle', { level: this.app.currentLevel }) || ('HSK Level ' + this.app.currentLevel + ' - Coming Soon');
        const soonBody = this.app.getTranslation('spanishLevelSoonBody') || 'Remaining Spanish levels will be added soon. You can use all 6 levels in English right now.';
        const switchToEnglishLabel = this.app.getTranslation('switchToEnglishBtn') || 'Switch to English';
        const backToHsk1Label = this.app.getTranslation('backToHsk1Btn') || 'Go to HSK 1';

        notification.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:16px;position:relative;">' +
                '<div style="display:flex;align-items:center;justify-content:center;">' +
                    '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>' +
                        '<line x1="12" y1="9" x2="12" y2="13"></line>' +
                        '<line x1="12" y1="17" x2="12.01" y2="17"></line>' +
                    '</svg>' +
                '</div>' +
                '<div style="font-size:1.1em;font-weight:600;margin-bottom:8px;">' + soonTitle + '</div>' +
                '<div style="line-height:1.5;opacity:0.95;max-width:400px;">' + soonBody + '</div>' +
                '<div style="display:flex;gap:12px;margin-top:8px;">' +
                    '<button id="switch-to-english" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);padding:10px 20px;border-radius:8px;cursor:pointer;font-size:0.9em;transition:all 0.3s ease;">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;">' +
                            '<path d="M3 5h12M9 3v2m-4 8h10m-5-2v2m-7 8h18M12 19v2"></path>' +
                        '</svg>' +
                        switchToEnglishLabel +
                    '</button>' +
                    '<button id="back-to-level1" style="background:rgba(255,255,255,0.9);color:#667eea;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:0.9em;font-weight:600;transition:all 0.3s ease;">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;">' +
                            '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
                            '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' +
                        '</svg>' +
                        backToHsk1Label +
                    '</button>' +
                '</div>' +
                '<button id="close-message" style="position:absolute;top:12px;right:12px;background:none;border:none;color:rgba(255,255,255,0.7);font-size:1.5em;cursor:pointer;padding:4px;border-radius:4px;transition:color 0.3s ease;">x</button>' +
            '</div>';

        const style = document.createElement('style');
        style.textContent =
            '@keyframes modalSlideIn {' +
                'from {opacity: 0; transform: translate(-50%, -50%) scale(0.8);} ' +
                'to {opacity: 1; transform: translate(-50%, -50%) scale(1);} ' +
            '}' +
            '@keyframes modalSlideOut {' +
                'from {opacity: 1; transform: translate(-50%, -50%) scale(1);} ' +
                'to {opacity: 0; transform: translate(-50%, -50%) scale(0.8);} ' +
            '}' +
            '@keyframes fadeIn {' +
                'from {opacity: 0;} ' +
                'to {opacity: 1;} ' +
            '}';

        document.head.appendChild(style);
        document.body.appendChild(notification);

        const backdrop = document.createElement('div');
        backdrop.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'right: 0',
            'bottom: 0',
            'background: rgba(0, 0, 0, 0.5)',
            'z-index: 9999',
            'animation: fadeIn 0.3s ease-out'
        ].join(';') + ';';
        document.body.appendChild(backdrop);

        const closeMessageBtn = notification.querySelector('#close-message');
        const switchToEnglishBtn = notification.querySelector('#switch-to-english');
        const backToLevel1Btn = notification.querySelector('#back-to-level1');

        if (switchToEnglishBtn) {
            switchToEnglishBtn.addEventListener('mouseenter', () => {
                switchToEnglishBtn.style.background = 'rgba(255,255,255,0.3)';
            });
            switchToEnglishBtn.addEventListener('mouseleave', () => {
                switchToEnglishBtn.style.background = 'rgba(255,255,255,0.2)';
            });
        }

        if (backToLevel1Btn) {
            backToLevel1Btn.addEventListener('mouseenter', () => {
                backToLevel1Btn.style.background = 'white';
            });
            backToLevel1Btn.addEventListener('mouseleave', () => {
                backToLevel1Btn.style.background = 'rgba(255,255,255,0.9)';
            });
        }

        if (closeMessageBtn) {
            closeMessageBtn.addEventListener('mouseenter', () => {
                closeMessageBtn.style.color = 'white';
            });
            closeMessageBtn.addEventListener('mouseleave', () => {
                closeMessageBtn.style.color = 'rgba(255,255,255,0.7)';
            });
        }

        const closeModal = () => {
            notification.style.animation = 'modalSlideOut 0.3s ease-out';
            backdrop.style.animation = 'fadeIn 0.3s ease-out reverse';

            setTimeout(() => {
                if (notification.parentNode) notification.remove();
                if (backdrop.parentNode) backdrop.remove();
                if (style.parentNode) style.remove();
            }, 300);
        };

        if (closeMessageBtn) {
            closeMessageBtn.addEventListener('click', closeModal);
        }
        backdrop.addEventListener('click', closeModal);

        if (switchToEnglishBtn) {
            switchToEnglishBtn.addEventListener('click', () => {
                if (window.languageManager) {
                    window.languageManager.setLanguage('en');
                }

                this.app.currentLanguage = 'en';
                localStorage.setItem('hsk-language', 'en');
                this.app.loadVocabulary();
                closeModal();
            });
        }

        if (backToLevel1Btn) {
            backToLevel1Btn.addEventListener('click', () => {
                this.app.currentLevel = 1;
                const levelSelector = document.getElementById('level-selector');
                if (levelSelector) {
                    levelSelector.value = '1';
                }

                this.app.setupPracticeSession();
                closeModal();
            });
        }

        setTimeout(() => {
            if (notification.parentNode) {
                closeModal();
            }
        }, 10000);
    }
}

window.ModalController = ModalController;
