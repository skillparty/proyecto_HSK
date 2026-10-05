import { describe, it, expect, beforeEach, vi } from "vitest";
import "../../assets/js/modules/theme-controller.js";
import "../../assets/js/modules/interaction-controller.js";
import "../../assets/js/modules/language-controller.js";

describe("Tone Color Scheme Setting", () => {
    let app;
    let themeController;

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute("data-tone-scheme");
        document.body.removeAttribute("data-tone-scheme");

        document.body.innerHTML = `
            <div class="header-settings-group">
                <label class="settings-row" id="tone-colors-settings-row">
                    <span class="settings-row-label">
                        <span data-i18n="toneColorsSelectorTitle">Colores Tonos</span>
                        <span class="tone-preview-dots">
                            <span class="tone-preview-dot tone-preview-dot-1"></span>
                            <span class="tone-preview-dot tone-preview-dot-2"></span>
                            <span class="tone-preview-dot tone-preview-dot-3"></span>
                            <span class="tone-preview-dot tone-preview-dot-4"></span>
                        </span>
                    </span>
                    <select id="tone-colors-select" title="Colores de Tonos">
                        <option value="default">Estándar (Rojo, Verde, Azul, Morado)</option>
                        <option value="alt">Alternativo (Amarillo, Azul, Verde, Rojo)</option>
                    </select>
                </label>
            </div>
        `;

        app = {
            isDarkMode: true,
            toneColorScheme: "default",
            eventBus: {
                emit: vi.fn(),
                on: vi.fn()
            },
            showHeaderNotification: vi.fn(),
            getTranslation: vi.fn((key) => {
                const map = {
                    toneColorsSelectorTitle: "Colores de Tonos",
                    toneColorsDefaultActivated: "Paleta estándar de tonos activada",
                    toneColorsAltActivated: "Paleta alternativa de tonos activada"
                };
                return map[key] || key;
            }),
            logDebug: vi.fn(),
            logWarn: vi.fn(),
            homeController: {
                setupEventListeners: vi.fn()
            },
            saveQuizSessionState: vi.fn()
        };

        themeController = new window.ThemeController(app);
        app.themeController = themeController;
        app.setToneScheme = (scheme) => themeController.setToneScheme(scheme);
        app.getToneScheme = () => themeController.getToneScheme();
    });

    it("initializes default tone scheme when no localStorage entry exists", () => {
        themeController.initializeToneScheme();
        expect(document.documentElement.getAttribute("data-tone-scheme")).toBe("default");
        expect(document.body.getAttribute("data-tone-scheme")).toBe("default");
        expect(themeController.getToneScheme()).toBe("default");
        expect(document.getElementById("tone-colors-select").value).toBe("default");
    });

    it("initializes saved 'alt' tone scheme from localStorage", () => {
        localStorage.setItem("hsk-tone-color-scheme", "alt");
        themeController.initializeToneScheme();
        expect(document.documentElement.getAttribute("data-tone-scheme")).toBe("alt");
        expect(document.body.getAttribute("data-tone-scheme")).toBe("alt");
        expect(themeController.getToneScheme()).toBe("alt");
        expect(document.getElementById("tone-colors-select").value).toBe("alt");
    });

    it("sets alternative tone scheme, updates DOM, storage, select element, and emits event", () => {
        themeController.setToneScheme("alt", true);

        expect(document.documentElement.getAttribute("data-tone-scheme")).toBe("alt");
        expect(document.body.getAttribute("data-tone-scheme")).toBe("alt");
        expect(localStorage.getItem("hsk-tone-color-scheme")).toBe("alt");
        expect(document.getElementById("tone-colors-select").value).toBe("alt");
        expect(app.eventBus.emit).toHaveBeenCalledWith("toneSchemeChanged", "alt");
        expect(app.showHeaderNotification).toHaveBeenCalledWith("Paleta alternativa de tonos activada");
    });

    it("switches back to standard/default tone scheme correctly", () => {
        themeController.setToneScheme("alt", false);
        expect(themeController.getToneScheme()).toBe("alt");

        themeController.setToneScheme("default", true);
        expect(document.documentElement.getAttribute("data-tone-scheme")).toBe("default");
        expect(document.body.getAttribute("data-tone-scheme")).toBe("default");
        expect(localStorage.getItem("hsk-tone-color-scheme")).toBe("default");
        expect(document.getElementById("tone-colors-select").value).toBe("default");
        expect(app.eventBus.emit).toHaveBeenCalledWith("toneSchemeChanged", "default");
        expect(app.showHeaderNotification).toHaveBeenCalledWith("Paleta estándar de tonos activada");
    });

    it("falls back to 'default' when given an invalid scheme name", () => {
        themeController.setToneScheme("unknown-palette", false);
        expect(document.documentElement.getAttribute("data-tone-scheme")).toBe("default");
        expect(themeController.getToneScheme()).toBe("default");
    });

    it("reacts to select dropdown change events via InteractionController setup", () => {
        const interactionController = new window.InteractionController(app);
        interactionController.setupEventListeners();

        const select = document.getElementById("tone-colors-select");
        select.value = "alt";
        select.dispatchEvent(new Event("change"));

        expect(document.documentElement.getAttribute("data-tone-scheme")).toBe("alt");
        expect(localStorage.getItem("hsk-tone-color-scheme")).toBe("alt");
    });

    it("updates microcopy for tone-colors-select in LanguageController", () => {
        const languageController = new window.LanguageController(app);
        languageController.getTranslation = vi.fn().mockReturnValue("Tone Colors");

        languageController.updateHeaderControlMicrocopy();

        const select = document.getElementById("tone-colors-select");
        expect(select.title).toBe("Tone Colors");
        expect(select.getAttribute("aria-label")).toBe("Tone Colors");
        expect(select.getAttribute("data-tooltip")).toBe("Tone Colors");
    });
});
