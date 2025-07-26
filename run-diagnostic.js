/**
 * Script para ejecutar diagnóstico completo de la aplicación HSK Learning
 * Este script se ejecuta en el contexto del navegador para analizar la aplicación
 */

(async function runCompleteDiagnostic() {
    console.log('🚀 Iniciando diagnóstico completo de HSK Learning...');
    
    // Esperar a que la aplicación se cargue completamente
    await new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
    
    // Esperar un poco más para asegurar que todo esté inicializado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        // Crear instancia del sistema de diagnóstico
        const diagnostic = new HSKDiagnosticSystem();
        
        // Ejecutar diagnóstico completo
        console.log('🔍 Ejecutando diagnóstico completo...');
        const report = await diagnostic.runFullDiagnostic();
        
        // Mostrar reporte en consola
        diagnostic.displayReport(report);
        
        // Generar reporte detallado para archivo
        const detailedReport = generateDetailedReport(report, diagnostic);
        
        // Mostrar resumen de problemas críticos
        console.log('\n🚨 PROBLEMAS CRÍTICOS DETECTADOS:');
        const criticalIssues = diagnostic.issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length === 0) {
            console.log('✅ No se encontraron problemas críticos');
        } else {
            criticalIssues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.component}] ${issue.description}`);
            });
        }
        
        // Mostrar problemas de advertencia
        console.log('\n⚠️ ADVERTENCIAS DETECTADAS:');
        const warningIssues = diagnostic.issues.filter(issue => issue.severity === 'warning');
        if (warningIssues.length === 0) {
            console.log('✅ No se encontraron advertencias');
        } else {
            warningIssues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.component}] ${issue.description}`);
            });
        }
        
        // Mostrar recomendaciones prioritarias
        console.log('\n💡 RECOMENDACIONES PRIORITARIAS:');
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
        
        // Guardar reporte en localStorage para acceso posterior
        try {
            localStorage.setItem('hsk_diagnostic_report', JSON.stringify({
                timestamp: report.timestamp,
                report: detailedReport,
                issues: diagnostic.issues,
                testResults: diagnostic.testResults
            }));
            console.log('💾 Reporte guardado en localStorage');
        } catch (e) {
            console.warn('⚠️ No se pudo guardar el reporte en localStorage:', e.message);
        }
        
        return {
            success: true,
            report: detailedReport,
            issues: diagnostic.issues,
            criticalCount: criticalIssues.length,
            warningCount: warningIssues.length
        };
        
    } catch (error) {
        console.error('❌ Error ejecutando diagnóstico:', error);
        return {
            success: false,
            error: error.message
        };
    }
})();

function generateDetailedReport(report, diagnostic) {
    const timestamp = new Date().toISOString();
    
    return `
# HSK Learning - Reporte de Diagnóstico Completo

**Fecha:** ${new Date(report.timestamp).toLocaleString()}
**Estado General:** ${report.overallStatus.toUpperCase()}
**Total de Problemas:** ${report.summary.totalIssues}

## Resumen Ejecutivo

- 🔴 **Problemas Críticos:** ${report.summary.criticalIssues}
- 🟡 **Advertencias:** ${report.summary.warningIssues}  
- 🔵 **Informativos:** ${report.summary.infoIssues}

## Análisis por Categorías

### 🎨 Interfaz (${report.categories.interface.length} problemas)
${report.categories.interface.length === 0 ? '✅ Sin problemas detectados' : 
  report.categories.interface.map(issue => 
    `- **${issue.severity.toUpperCase()}** [${issue.component}]: ${issue.description}`
  ).join('\n')}

### ⚙️ Funcionalidad (${report.categories.functionality.length} problemas)
${report.categories.functionality.length === 0 ? '✅ Sin problemas detectados' : 
  report.categories.functionality.map(issue => 
    `- **${issue.severity.toUpperCase()}** [${issue.component}]: ${issue.description}`
  ).join('\n')}

### 🐛 Errores (${report.categories.error.length} problemas)
${report.categories.error.length === 0 ? '✅ Sin errores detectados' : 
  report.categories.error.map(issue => 
    `- **${issue.severity.toUpperCase()}** [${issue.component}]: ${issue.description}`
  ).join('\n')}

### ⚡ Rendimiento (${report.categories.performance.length} problemas)
${report.categories.performance.length === 0 ? '✅ Sin problemas de rendimiento' : 
  report.categories.performance.map(issue => 
    `- **${issue.severity.toUpperCase()}** [${issue.component}]: ${issue.description}`
  ).join('\n')}

## Resultados de Pruebas Detalladas

### Estructura DOM
- **Estado:** ${diagnostic.testResults.domStructure?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Elementos Faltantes:** ${diagnostic.testResults.domStructure?.missingElements || 0}
- **Total Verificados:** ${diagnostic.testResults.domStructure?.totalChecked || 0}

### Validación CSS
- **Estado:** ${diagnostic.testResults.cssValidation?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Problemas:** ${diagnostic.testResults.cssValidation?.issues?.length || 0}

### Funcionalidad JavaScript
- **Estado:** ${diagnostic.testResults.jsFunctionality?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Problemas:** ${diagnostic.testResults.jsFunctionality?.issues?.length || 0}

### Navegación
- **Estado:** ${diagnostic.testResults.navigation?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Tabs Verificados:** ${diagnostic.testResults.navigation?.tabsChecked || 0}

### Sistema de Flashcards
- **Estado:** ${diagnostic.testResults.flashcards?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Problemas:** ${diagnostic.testResults.flashcards?.issues?.length || 0}

### Controles Interactivos
- **Estado:** ${diagnostic.testResults.interactiveControls?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Problemas:** ${diagnostic.testResults.interactiveControls?.issues?.length || 0}

### Sistema de Temas
- **Estado:** ${diagnostic.testResults.themes?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Problemas:** ${diagnostic.testResults.themes?.issues?.length || 0}

### Persistencia de Datos
- **Estado:** ${diagnostic.testResults.dataPersistence?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Problemas:** ${diagnostic.testResults.dataPersistence?.issues?.length || 0}

### Rendimiento
- **Estado:** ${diagnostic.testResults.performance?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Tiempo de Carga:** ${diagnostic.testResults.performance?.loadTime?.toFixed(2) || 'N/A'} ms
- **Uso de Memoria:** ${diagnostic.testResults.performance?.memoryUsage || 'N/A'} MB

### Diseño Responsive
- **Estado:** ${diagnostic.testResults.responsiveDesign?.passed ? '✅ PASÓ' : '❌ FALLÓ'}
- **Problemas:** ${diagnostic.testResults.responsiveDesign?.issues?.length || 0}

## Log de Errores

${diagnostic.errorLog.length === 0 ? '✅ No se registraron errores durante el diagnóstico' : 
  diagnostic.errorLog.map((error, index) => 
    `### Error ${index + 1}
- **Tipo:** ${error.type}
- **Mensaje:** ${error.message}
- **Archivo:** ${error.filename || 'N/A'}
- **Línea:** ${error.line || 'N/A'}
- **Timestamp:** ${error.timestamp}`
  ).join('\n\n')}

## Recomendaciones de Acción

${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## Próximos Pasos

1. **Inmediato:** Corregir todos los problemas críticos identificados
2. **Corto Plazo:** Abordar las advertencias más importantes
3. **Mediano Plazo:** Optimizar rendimiento y mejorar experiencia de usuario
4. **Largo Plazo:** Implementar monitoreo continuo y pruebas automatizadas

---

*Reporte generado automáticamente por HSK Diagnostic System v1.0*
*Timestamp: ${timestamp}*
`;
}

// Función auxiliar para acceder al último reporte desde consola
window.getLastDiagnosticReport = function() {
    try {
        const saved = localStorage.getItem('hsk_diagnostic_report');
        if (saved) {
            const data = JSON.parse(saved);
            console.log('📊 Último reporte de diagnóstico:');
            console.log(data.report);
            return data;
        } else {
            console.log('❌ No hay reportes de diagnóstico guardados');
            return null;
        }
    } catch (e) {
        console.error('❌ Error accediendo al reporte:', e.message);
        return null;
    }
};

console.log('🔧 Script de diagnóstico cargado. El diagnóstico se ejecutará automáticamente.');