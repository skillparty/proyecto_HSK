class ThemeController {
    constructor(app) {
        this.app = app;
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('hsk-theme') || 'dark';
        this.app.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
        this.updateThemeButton();
    }

    toggleTheme() {
        this.app.isDarkMode = !this.app.isDarkMode;
        this.applyTheme();
        this.updateThemeButton();
        localStorage.setItem('hsk-theme', this.app.isDarkMode ? 'dark' : 'light');

        const message = this.app.isDarkMode
            ? (this.app.getTranslation('darkModeActivated') || 'Tema oscuro activado')
            : (this.app.getTranslation('lightModeActivated') || 'Tema claro activado');

        this.app.showHeaderNotification(message);
        this.app.logDebug('[theme] Toggled to ' + (this.app.isDarkMode ? 'dark' : 'light'));
    }

    applyTheme() {
        const mode = this.app.isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', mode);
        document.body.setAttribute('data-theme', mode);

        if (this.app.isDarkMode) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }

        const voice = this.app.selectedVoice || 'female';
        const logoPath = (voice === 'male') ? 'assets/images/logo06.png' : 'assets/images/logo05.png';

        const logo = document.getElementById('app-logo-img');
        if (logo) {
            logo.src = logoPath;
        }

        const welcomeLogo = document.querySelector('.welcome-logo');
        if (welcomeLogo) {
            welcomeLogo.src = logoPath;
        }

        const favicon = document.getElementById('app-favicon');
        if (favicon) {
            favicon.setAttribute('href', logoPath);
        }

        const touchIcon = document.getElementById('app-touch-icon');
        if (touchIcon) {
            touchIcon.setAttribute('href', logoPath);
        }

        const root = document.documentElement;
        if (this.app.isDarkMode) {
            // Variables de tema genéricas (Black & Dark Grey)
            root.style.setProperty('--theme-bg', '#000000');
            root.style.setProperty('--theme-surface', '#121212');
            root.style.setProperty('--theme-text', '#ffffff');

            // Sobrescribir variables de tokens de diseño para modo oscuro
            root.style.setProperty('--color-bg-app', '#000000');
            root.style.setProperty('--color-bg-panel', '#121212');
            root.style.setProperty('--color-bg-card', '#121212');
            root.style.setProperty('--color-bg-input', '#000000');
            root.style.setProperty('--color-bg-hover', '#27272a');
            root.style.setProperty('--color-border', '#27272a');
            root.style.setProperty('--color-border-subtle', '#121212');
            root.style.setProperty('--color-text-main', '#ffffff');
            root.style.setProperty('--color-text-charcoal', '#f4f4f5');
            root.style.setProperty('--color-text-muted', '#a1a1aa');
            root.style.setProperty('--color-text-dim', '#71717a');

            // Sobrescribir alias de compatibilidad de diseño para modo oscuro
            root.style.setProperty('--bg-app', '#000000');
            root.style.setProperty('--bg-panel', '#121212');
            root.style.setProperty('--bg-card', '#121212');
            root.style.setProperty('--text-main', '#ffffff');
            root.style.setProperty('--text-muted', '#a1a1aa');
            root.style.setProperty('--text-dim', '#71717a');
            root.style.setProperty('--card-bg', '#121212');
            root.style.setProperty('--border-color', '#27272a');
            root.style.setProperty('--input-bg', '#000000');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#a1a1aa');
        } else {
            // En modo claro eliminamos las propiedades en línea para que los tokens por defecto de design-tokens.css tomen el control natural
            const props = [
                '--theme-bg', '--theme-surface', '--theme-text',
                '--color-bg-app', '--color-bg-panel', '--color-bg-card', '--color-bg-input', '--color-bg-hover',
                '--color-border', '--color-border-subtle',
                '--color-text-main', '--color-text-charcoal', '--color-text-muted', '--color-text-dim',
                '--bg-app', '--bg-panel', '--bg-card', '--text-main', '--text-muted', '--text-dim',
                '--card-bg', '--border-color', '--input-bg', '--text-primary', '--text-secondary'
            ];
            props.forEach(p => root.style.removeProperty(p));
        }

        let bgSource = "url('assets/images/background01.png')";

        // El degradado del fondo debe adaptarse según el tema seleccionado
        const overlay = this.app.isDarkMode
            ? 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65))'
            : 'linear-gradient(rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.92))';

        document.body.style.background = overlay + ', ' + bgSource;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }

    updateThemeButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) {
            this.app.logWarn('[theme] Theme toggle button not found');
            return;
        }

        const nextThemeLabel = this.app.isDarkMode
            ? (this.app.getTranslation('switchToLightMode') || 'Switch to light mode')
            : (this.app.getTranslation('switchToDarkMode') || 'Switch to dark mode');

        themeToggle.title = nextThemeLabel;
        themeToggle.setAttribute('aria-label', nextThemeLabel);
        themeToggle.setAttribute('data-tooltip', nextThemeLabel);

        const lightIcon = themeToggle.querySelector('.light-icon');
        const darkIcon = themeToggle.querySelector('.dark-icon');

        if (!lightIcon || !darkIcon) {
            if (this.app.isDarkMode) {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
                themeToggle.classList.add('active');
            } else {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
                themeToggle.classList.remove('active');
            }
            return;
        }

        if (this.app.isDarkMode) {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
            themeToggle.classList.add('active');
        } else {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
            themeToggle.classList.remove('active');
        }
    }
}

window.ThemeController = ThemeController;
