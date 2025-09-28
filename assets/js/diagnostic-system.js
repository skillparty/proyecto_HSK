/**
 * HSK Learning - Sistema de Diagnóstico Automatizado
 * Herramienta completa para detectar y diagnosticar problemas en la aplicación
 */

class HSKDiagnosticSystem {
    constructor() {
        this.issues = [];
        this.testResults = {};
        this.startTime = Date.now();
        this.errorLog = [];
        this.performanceMetrics = {};
        
        // Configurar monitoreo de errores
        this.setupErrorMonitoring();
        
        console.log('🔍 HSK Diagnostic System initialized');
    }

    /**
     * Configurar monitoreo de errores en tiempo real
     */
    setupErrorMonitoring() {
        // Capturar errores JavaScript
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Monitorear errores de consola
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.logError({
                type: 'Console Error',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalConsoleError.apply(console, args);
        };
    }

    /**
     * Registrar error en el log
     */
    logError(error) {
        this.errorLog.push(error);
        this.addIssue('error', 'critical', 'Error Detection', error.message, error.filename || 'Unknown');
    }

    /**
     * Ejecutar diagnóstico completo de la aplicación
     */
    async runFullDiagnostic() {
        console.log('🚀 Starting full diagnostic...');
        
        const diagnosticStart = performance.now();
        
        try {
            // Limpiar resultados anteriores
            this.issues = [];
            this.testResults = {};
            
            // Ejecutar todas las pruebas
            await this.checkDOMStructure();
            await this.validateCSS();
            await this.testJavaScriptFunctionality();
            await this.validateNavigation();
            await this.testFlashcards();
            await this.testInteractiveControls();
            await this.validateThemes();
            await this.testDataPersistence();
            await this.checkPerformance();
            await this.validateResponsiveDesign();
            
            const diagnosticTime = performance.now() - diagnosticStart;
            this.performanceMetrics.diagnosticTime = diagnosticTime;
            
            // Generar reporte
            const report = this.generateDiagnosticReport();
            
            console.log('✅ Full diagnostic completed in', diagnosticTime.toFixed(2), 'ms');
            return report;
            
        } catch (error) {
            console.error('❌ Diagnostic failed:', error);
            this.addIssue('error', 'critical', 'Diagnostic System', 'Diagnostic system failed: ' + error.message);
            return this.generateDiagnosticReport();
        }
    }

    /**
     * Verificar estructura DOM básica
     */
    async checkDOMStructure() {
        console.log('🔍 Checking DOM structure...');
        
        const requiredElements = [
            'app-container',
            'app-header', 
            'nav-container',
            'content-area',
            'practice',
            'flashcard',
            'level-select',
            'theme-toggle'
        ];
        
        let missingElements = 0;
        
        requiredElements.forEach(id => {
            const element = document.getElementById(id) || document.querySelector(`.${id}`);
            if (!element) {
                this.addIssue('interface', 'critical', 'DOM Structure', `Missing required element: ${id}`);
                missingElements++;
            }
        });
        
        this.testResults.domStructure = {
            passed: missingElements === 0,
            missingElements,
            totalChecked: requiredElements.length
        };
        
        if (missingElements === 0) {
            console.log('✅ DOM structure check passed');
        } else {
            console.log(`❌ DOM structure check failed: ${missingElements} missing elements`);
        }
    }

    /**
     * Validar CSS y estilos
     */
    async validateCSS() {
        console.log('🎨 Validating CSS...');
        
        const cssIssues = [];
        
        // Verificar que el CSS principal esté cargado
        const stylesheets = Array.from(document.styleSheets);
        const mainCSS = stylesheets.find(sheet => 
            sheet.href && sheet.href.includes('styles-v2.css')
        );
        
        if (!mainCSS) {
            this.addIssue('interface', 'critical', 'CSS Loading', 'Main stylesheet (styles-v2.css) not loaded');
            cssIssues.push('Main CSS not loaded');
        }
        
        // Verificar variables CSS críticas
        const testElement = document.createElement('div');
        document.body.appendChild(testElement);
        
        const criticalVariables = [
            '--color-primary',
            '--color-secondary', 
            '--bg-primary',
            '--text-primary',
            '--font-family-primary'
        ];
        
        criticalVariables.forEach(variable => {
            const value = getComputedStyle(testElement).getPropertyValue(variable);
            if (!value || value.trim() === '') {
                this.addIssue('interface', 'warning', 'CSS Variables', `CSS variable ${variable} not defined`);
                cssIssues.push(`Missing variable: ${variable}`);
            }
        });
        
        document.body.removeChild(testElement);
        
        this.testResults.cssValidation = {
            passed: cssIssues.length === 0,
            issues: cssIssues
        };
        
        if (cssIssues.length === 0) {
            console.log('✅ CSS validation passed');
        } else {
            console.log(`⚠️ CSS validation found ${cssIssues.length} issues`);
        }
    }

    /**
     * Probar funcionalidad JavaScript básica
     */
    async testJavaScriptFunctionality() {
        console.log('⚙️ Testing JavaScript functionality...');
        
        const jsIssues = [];
        
        // Verificar que la aplicación principal esté cargada
        if (typeof window.app === 'undefined') {
            this.addIssue('functionality', 'critical', 'App Initialization', 'Main app object not found');
            jsIssues.push('App not initialized');
        } else {
            // Verificar métodos críticos
            const criticalMethods = ['switchTab', 'nextWord', 'flipCard', 'updateStatsDisplay'];
            criticalMethods.forEach(method => {
                if (typeof window.app[method] !== 'function') {
                    this.addIssue('functionality', 'warning', 'App Methods', `Method ${method} not found`);
                    jsIssues.push(`Missing method: ${method}`);
                }
            });
        }
        
        // Verificar carga de vocabulario
        if (window.app && (!window.app.vocabulary || window.app.vocabulary.length === 0)) {
            this.addIssue('functionality', 'critical', 'Vocabulary Loading', 'Vocabulary not loaded or empty');
            jsIssues.push('Vocabulary not loaded');
        }
        
        this.testResults.jsFunctionality = {
            passed: jsIssues.length === 0,
            issues: jsIssues
        };
        
        if (jsIssues.length === 0) {
            console.log('✅ JavaScript functionality test passed');
        } else {
            console.log(`❌ JavaScript functionality test found ${jsIssues.length} issues`);
        }
    }

    /**
     * Validar navegación entre tabs
     */
    async validateNavigation() {
        console.log('🧭 Validating navigation...');
        
        const navIssues = [];
        const tabs = ['practice', 'browse', 'quiz', 'stats'];
        
        tabs.forEach(tabName => {
            const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
            const tabPanel = document.getElementById(tabName);
            
            if (!tabButton) {
                this.addIssue('functionality', 'warning', 'Navigation', `Tab button for ${tabName} not found`);
                navIssues.push(`Missing tab button: ${tabName}`);
            }
            
            if (!tabPanel) {
                this.addIssue('functionality', 'warning', 'Navigation', `Tab panel for ${tabName} not found`);
                navIssues.push(`Missing tab panel: ${tabName}`);
            }
        });
        
        this.testResults.navigation = {
            passed: navIssues.length === 0,
            issues: navIssues,
            tabsChecked: tabs.length
        };
        
        if (navIssues.length === 0) {
            console.log('✅ Navigation validation passed');
        } else {
            console.log(`⚠️ Navigation validation found ${navIssues.length} issues`);
        }
    }

    /**
     * Probar sistema de flashcards
     */
    async testFlashcards() {
        console.log('🃏 Testing flashcard system...');
        
        const flashcardIssues = [];
        
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) {
            this.addIssue('functionality', 'critical', 'Flashcards', 'Flashcard element not found');
            flashcardIssues.push('Flashcard element missing');
        } else {
            // Verificar estructura interna
            const requiredElements = ['.flashcard-inner', '.card-front', '.card-back'];
            requiredElements.forEach(selector => {
                if (!flashcard.querySelector(selector)) {
                    this.addIssue('functionality', 'warning', 'Flashcards', `Flashcard element ${selector} not found`);
                    flashcardIssues.push(`Missing element: ${selector}`);
                }
            });
        }
        
        // Verificar botones de control
        const controlButtons = ['flip-btn', 'next-btn'];
        controlButtons.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (!button) {
                this.addIssue('functionality', 'warning', 'Flashcards', `Control button ${btnId} not found`);
                flashcardIssues.push(`Missing button: ${btnId}`);
            }
        });
        
        this.testResults.flashcards = {
            passed: flashcardIssues.length === 0,
            issues: flashcardIssues
        };
        
        if (flashcardIssues.length === 0) {
            console.log('✅ Flashcard system test passed');
        } else {
            console.log(`⚠️ Flashcard system test found ${flashcardIssues.length} issues`);
        }
    }

    /**
     * Probar controles interactivos
     */
    async testInteractiveControls() {
        console.log('🎛️ Testing interactive controls...');
        
        const controlIssues = [];
        
        const criticalControls = [
            'level-select',
            'theme-toggle',
            'language-select'
        ];
        
        criticalControls.forEach(controlId => {
            const control = document.getElementById(controlId);
            if (!control) {
                this.addIssue('functionality', 'warning', 'Interactive Controls', `Control ${controlId} not found`);
                controlIssues.push(`Missing control: ${controlId}`);
            }
        });
        
        // Verificar radio buttons de modo de práctica
        const practiceMode = document.querySelector('input[name="practice-mode"]');
        if (!practiceMode) {
            this.addIssue('functionality', 'warning', 'Interactive Controls', 'Practice mode radio buttons not found');
            controlIssues.push('Practice mode controls missing');
        }
        
        this.testResults.interactiveControls = {
            passed: controlIssues.length === 0,
            issues: controlIssues
        };
        
        if (controlIssues.length === 0) {
            console.log('✅ Interactive controls test passed');
        } else {
            console.log(`⚠️ Interactive controls test found ${controlIssues.length} issues`);
        }
    }

    /**
     * Validar temas (claro/oscuro)
     */
    async validateThemes() {
        console.log('🌓 Validating themes...');
        
        const themeIssues = [];
        
        // Verificar que el toggle de tema funcione
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) {
            this.addIssue('interface', 'warning', 'Theme System', 'Theme toggle button not found');
            themeIssues.push('Theme toggle missing');
        }
        
        // Verificar clases de tema en body
        const body = document.body;
        const hasThemeClass = body.classList.contains('light-theme') || body.classList.contains('dark-theme');
        if (!hasThemeClass) {
            this.addIssue('interface', 'warning', 'Theme System', 'No theme class found on body element');
            themeIssues.push('No theme class on body');
        }
        
        this.testResults.themes = {
            passed: themeIssues.length === 0,
            issues: themeIssues
        };
        
        if (themeIssues.length === 0) {
            console.log('✅ Theme validation passed');
        } else {
            console.log(`⚠️ Theme validation found ${themeIssues.length} issues`);
        }
    }

    /**
     * Probar persistencia de datos
     */
    async testDataPersistence() {
        console.log('💾 Testing data persistence...');
        
        const persistenceIssues = [];
        
        try {
            // Probar localStorage
            const testKey = 'hsk_diagnostic_test';
            const testValue = 'test_data';
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            
            if (retrieved !== testValue) {
                this.addIssue('functionality', 'warning', 'Data Persistence', 'localStorage not working correctly');
                persistenceIssues.push('localStorage not working');
            }
            
            localStorage.removeItem(testKey);
            
        } catch (error) {
            this.addIssue('functionality', 'critical', 'Data Persistence', 'localStorage not available: ' + error.message);
            persistenceIssues.push('localStorage not available');
        }
        
        this.testResults.dataPersistence = {
            passed: persistenceIssues.length === 0,
            issues: persistenceIssues
        };
        
        if (persistenceIssues.length === 0) {
            console.log('✅ Data persistence test passed');
        } else {
            console.log(`⚠️ Data persistence test found ${persistenceIssues.length} issues`);
        }
    }

    /**
     * Verificar rendimiento
     */
    async checkPerformance() {
        console.log('⚡ Checking performance...');
        
        const performanceIssues = [];
        
        // Verificar tiempo de carga
        const loadTime = performance.now() - this.startTime;
        if (loadTime > 5000) {
            this.addIssue('performance', 'warning', 'Load Time', `Slow load time: ${loadTime.toFixed(2)}ms`);
            performanceIssues.push('Slow load time');
        }
        
        // Verificar memoria (si está disponible)
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            if (memoryUsage > 50) {
                this.addIssue('performance', 'warning', 'Memory Usage', `High memory usage: ${memoryUsage.toFixed(2)}MB`);
                performanceIssues.push('High memory usage');
            }
        }
        
        this.testResults.performance = {
            passed: performanceIssues.length === 0,
            issues: performanceIssues,
            loadTime: loadTime,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 'N/A'
        };
        
        if (performanceIssues.length === 0) {
            console.log('✅ Performance check passed');
        } else {
            console.log(`⚠️ Performance check found ${performanceIssues.length} issues`);
        }
    }

    /**
     * Validar diseño responsive
     */
    async validateResponsiveDesign() {
        console.log('📱 Validating responsive design...');
        
        const responsiveIssues = [];
        
        // Verificar meta viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            this.addIssue('interface', 'warning', 'Responsive Design', 'Viewport meta tag not found');
            responsiveIssues.push('Missing viewport meta tag');
        }
        
        // Verificar media queries en CSS
        const hasMediaQueries = Array.from(document.styleSheets).some(sheet => {
            try {
                return Array.from(sheet.cssRules || []).some(rule => 
                    rule.type === CSSRule.MEDIA_RULE
                );
            } catch (e) {
                return false;
            }
        });
        
        if (!hasMediaQueries) {
            this.addIssue('interface', 'warning', 'Responsive Design', 'No media queries found in CSS');
            responsiveIssues.push('No media queries found');
        }
        
        this.testResults.responsiveDesign = {
            passed: responsiveIssues.length === 0,
            issues: responsiveIssues
        };
        
        if (responsiveIssues.length === 0) {
            console.log('✅ Responsive design validation passed');
        } else {
            console.log(`⚠️ Responsive design validation found ${responsiveIssues.length} issues`);
        }
    }

    /**
     * Agregar issue al registro
     */
    addIssue(category, severity, component, description, location = '') {
        this.issues.push({
            id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category,
            severity,
            component,
            description,
            location,
            timestamp: new Date().toISOString(),
            status: 'detected'
        });
    }

    /**
     * Generar reporte de diagnóstico completo
     */
    generateDiagnosticReport() {
        const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
        const warningIssues = this.issues.filter(issue => issue.severity === 'warning');
        const infoIssues = this.issues.filter(issue => issue.severity === 'info');
        
        const overallStatus = criticalIssues.length > 0 ? 'critical' : 
                             warningIssues.length > 0 ? 'warning' : 'good';
        
        const report = {
            timestamp: new Date().toISOString(),
            overallStatus,
            summary: {
                totalIssues: this.issues.length,
                criticalIssues: criticalIssues.length,
                warningIssues: warningIssues.length,
                infoIssues: infoIssues.length
            },
            categories: {
                interface: this.issues.filter(issue => issue.category === 'interface'),
                functionality: this.issues.filter(issue => issue.category === 'functionality'),
                error: this.issues.filter(issue => issue.category === 'error'),
                performance: this.issues.filter(issue => issue.category === 'performance')
            },
            testResults: this.testResults,
            errorLog: this.errorLog,
            performanceMetrics: this.performanceMetrics,
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    /**
     * Generar recomendaciones basadas en los problemas encontrados
     */
    generateRecommendations() {
        const recommendations = [];
        
        const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length > 0) {
            recommendations.push('Corregir inmediatamente todos los problemas críticos antes de continuar');
        }
        
        const interfaceIssues = this.issues.filter(issue => issue.category === 'interface');
        if (interfaceIssues.length > 0) {
            recommendations.push('Revisar y corregir problemas de interfaz para mejorar la experiencia del usuario');
        }
        
        const functionalityIssues = this.issues.filter(issue => issue.category === 'functionality');
        if (functionalityIssues.length > 0) {
            recommendations.push('Reparar funcionalidades defectuosas para asegurar el correcto funcionamiento');
        }
        
        const errorIssues = this.issues.filter(issue => issue.category === 'error');
        if (errorIssues.length > 0) {
            recommendations.push('Eliminar todos los errores de JavaScript para mejorar la estabilidad');
        }
        
        const performanceIssues = this.issues.filter(issue => issue.category === 'performance');
        if (performanceIssues.length > 0) {
            recommendations.push('Optimizar rendimiento para mejorar la velocidad de la aplicación');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('La aplicación está funcionando correctamente. Continuar con mantenimiento regular.');
        }
        
        return recommendations;
    }

    /**
     * Mostrar reporte en consola de manera formateada
     */
    displayReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 HSK LEARNING - DIAGNOSTIC REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n🕐 Timestamp: ${report.timestamp}`);
        console.log(`📈 Overall Status: ${this.getStatusEmoji(report.overallStatus)} ${report.overallStatus.toUpperCase()}`);
        
        console.log('\n📋 SUMMARY:');
        console.log(`   Total Issues: ${report.summary.totalIssues}`);
        console.log(`   🔴 Critical: ${report.summary.criticalIssues}`);
        console.log(`   🟡 Warning: ${report.summary.warningIssues}`);
        console.log(`   🔵 Info: ${report.summary.infoIssues}`);
        
        if (report.summary.totalIssues > 0) {
            console.log('\n🔍 ISSUES BY CATEGORY:');
            Object.entries(report.categories).forEach(([category, issues]) => {
                if (issues.length > 0) {
                    console.log(`\n   ${category.toUpperCase()} (${issues.length} issues):`);
                    issues.forEach(issue => {
                        console.log(`   ${this.getSeverityEmoji(issue.severity)} ${issue.component}: ${issue.description}`);
                    });
                }
            });
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        report.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
        
        console.log('\n' + '='.repeat(60));
        
        return report;
    }

    getStatusEmoji(status) {
        switch (status) {
            case 'critical': return '🔴';
            case 'warning': return '🟡';
            case 'good': return '🟢';
            default: return '⚪';
        }
    }

    getSeverityEmoji(severity) {
        switch (severity) {
            case 'critical': return '🔴';
            case 'warning': return '🟡';
            case 'info': return '🔵';
            default: return '⚪';
        }
    }
}

// Función para ejecutar diagnóstico desde consola
window.runHSKDiagnostic = async function() {
    const diagnostic = new HSKDiagnosticSystem();
    const report = await diagnostic.runFullDiagnostic();
    return diagnostic.displayReport(report);
};

// Auto-inicializar si estamos en modo diagnóstico
if (window.location.search.includes('diagnostic=true')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.runHSKDiagnostic();
        }, 1000);
    });
}

console.log('🔧 HSK Diagnostic System loaded. Run window.runHSKDiagnostic() to start diagnosis.');